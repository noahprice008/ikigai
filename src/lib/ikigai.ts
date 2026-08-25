export type DimensionKey = "love" | "good_at" | "needs" | "paid_for";

export type Item = { id: string; label: string; score: number };

export type Dimension = { items: Item[]; avg_score: number };

export type Snapshot = {
  at: number;
  avgs: Record<DimensionKey, number>;
  counts: Record<DimensionKey, number>;
  note?: string;
};

export type IkigaiState = {
  dimensions: Record<DimensionKey, Dimension>;
  theme: "light" | "dark";
  history: Snapshot[];
  premium: boolean;
};

export const DIMENSION_ORDER: DimensionKey[] = ["love", "good_at", "needs", "paid_for"];

export const DIMENSION_META: Record<
  DimensionKey,
  {
    title: string;
    question: string;
    placeholder: string;
    colorVar: string;
    swatchClass: string;
  }
> = {
  love: {
    title: "What you love",
    question: "The things you'd do for their own sake.",
    placeholder: "e.g. Long walks with no destination",
    colorVar: "var(--love)",
    swatchClass: "bg-love",
  },
  good_at: {
    title: "What you're good at",
    question: "Where your craft and instinct already live.",
    placeholder: "e.g. Explaining hard ideas simply",
    colorVar: "var(--good-at)",
    swatchClass: "bg-good-at",
  },
  needs: {
    title: "What the world needs",
    question: "The gaps you notice and care about.",
    placeholder: "e.g. Calmer digital tools",
    colorVar: "var(--needs)",
    swatchClass: "bg-needs",
  },
  paid_for: {
    title: "What you can be paid for",
    question: "Where your work meets a market.",
    placeholder: "e.g. Design consulting",
    colorVar: "var(--paid-for)",
    swatchClass: "bg-paid-for",
  },
};

export const STORAGE_KEY = "ikigai-map-v1";

export function average(items: Item[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + item.score, 0);
  return Math.round((total / items.length) * 100) / 100;
}

export function emptyState(): IkigaiState {
  return {
    dimensions: {
      love: { items: [], avg_score: 0 },
      good_at: { items: [], avg_score: 0 },
      needs: { items: [], avg_score: 0 },
      paid_for: { items: [], avg_score: 0 },
    },
    theme: "light",
  };
}

export function seedState(): IkigaiState {
  const state = emptyState();
  const seeds: Record<DimensionKey, [string, number][]> = {
    love: [
      ["Drawing systems on paper", 5],
      ["Teaching one person at a time", 4],
    ],
    good_at: [["Turning mess into structure", 4]],
    needs: [["Tools that slow people down", 3]],
    paid_for: [["Consulting on product clarity", 4]],
  };
  for (const key of DIMENSION_ORDER) {
    state.dimensions[key].items = seeds[key].map(([label, score], index) => ({
      id: `${key}-${index}`,
      label,
      score,
    }));
    state.dimensions[key].avg_score = average(state.dimensions[key].items);
  }
  return state;
}

export function normalize(raw: unknown): IkigaiState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const input = raw as Partial<IkigaiState>;
  const state = emptyState();
  if (input.theme === "dark" || input.theme === "light") state.theme = input.theme;
  const dims = input.dimensions;
  if (typeof dims !== "object" || dims === null) return state;
  for (const key of DIMENSION_ORDER) {
    const dim = (dims as Record<string, unknown>)[key] as Dimension | undefined;
    const items = Array.isArray(dim?.items) ? dim!.items : [];
    state.dimensions[key].items = items
      .filter((item) => item && typeof item.label === "string")
      .map((item, index) => ({
        id: typeof item.id === "string" ? item.id : `${key}-${index}`,
        label: item.label,
        score: Math.min(5, Math.max(1, Math.round(Number(item.score) || 3))),
      }));
    state.dimensions[key].avg_score = average(state.dimensions[key].items);
  }
  return state;
}

/* ---------- Venn geometry ---------- */

export const VENN = {
  size: 460,
  center: 230,
  offset: 92,
  minRadius: 46,
  perScore: 15,
} as const;

export function radiusFor(avg: number): number {
  if (avg <= 0) return VENN.minRadius * 0.72;
  return VENN.minRadius + avg * VENN.perScore;
}

export const CIRCLE_POSITIONS: Record<DimensionKey, { cx: number; cy: number }> = {
  love: { cx: VENN.center, cy: VENN.center - VENN.offset },
  good_at: { cx: VENN.center + VENN.offset, cy: VENN.center },
  paid_for: { cx: VENN.center, cy: VENN.center + VENN.offset },
  needs: { cx: VENN.center - VENN.offset, cy: VENN.center },
};

export type ZoneKey = "passion" | "mission" | "profession" | "vocation";

export const ZONES: Record<
  ZoneKey,
  { label: string; pair: [DimensionKey, DimensionKey]; x: number; y: number }
> = {
  passion: {
    label: "Passion",
    pair: ["love", "good_at"],
    x: VENN.center + 58,
    y: VENN.center - 58,
  },
  profession: {
    label: "Profession",
    pair: ["good_at", "paid_for"],
    x: VENN.center + 58,
    y: VENN.center + 58,
  },
  vocation: {
    label: "Vocation",
    pair: ["needs", "paid_for"],
    x: VENN.center - 58,
    y: VENN.center + 58,
  },
  mission: {
    label: "Mission",
    pair: ["love", "needs"],
    x: VENN.center - 58,
    y: VENN.center - 58,
  },
};

const ADJACENT_DISTANCE = Math.SQRT2 * VENN.offset;

/** 0 → no overlap, 1 → deeply overlapped. */
export function zoneStrength(state: IkigaiState, zone: ZoneKey): number {
  const [a, b] = ZONES[zone].pair;
  const ra = radiusFor(state.dimensions[a].avg_score);
  const rb = radiusFor(state.dimensions[b].avg_score);
  if (state.dimensions[a].items.length === 0 || state.dimensions[b].items.length === 0) return 0;
  const overlap = ra + rb - ADJACENT_DISTANCE;
  return clamp01(overlap / 90);
}

/** Central Ikigai only exists when every circle reaches past the shared center. */
export function ikigaiStrength(state: IkigaiState): number {
  let weakest = Infinity;
  for (const key of DIMENSION_ORDER) {
    const dim = state.dimensions[key];
    if (dim.items.length === 0) return 0;
    weakest = Math.min(weakest, radiusFor(dim.avg_score) - VENN.offset);
  }
  return clamp01(weakest / 26);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
