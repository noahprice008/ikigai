export type DimensionKey = "love" | "good_at" | "needs" | "paid_for";

export type Item = { id: string; label: string; score: number };

export type Dimension = { items: Item[]; avg_score: number };

export type PaletteKey = "editorial" | "moss" | "dusk" | "ink" | "bloom";

export const PALETTE_ORDER: PaletteKey[] = ["editorial", "moss", "dusk", "ink", "bloom"];

export const PALETTE_META: Record<
  PaletteKey,
  { name: string; description: string }
> = {
  editorial: { name: "Editorial", description: "Warm paper and amber ink." },
  moss: { name: "Moss", description: "Quiet forest greens and soft stone." },
  dusk: { name: "Dusk", description: "Deep indigo with rose-gold highlights." },
  ink: { name: "Ink", description: "High-contrast monochrome for focus." },
  bloom: { name: "Bloom", description: "Cherry blossom and pale clay." },
};

export type PremiumPrefs = {
  palette: PaletteKey;
  audioEnabled: boolean;
  paperTexture: boolean;
};

export type Snapshot = {
  at: number;
  avgs: Record<DimensionKey, number>;
  counts: Record<DimensionKey, number>;
  note?: string | undefined;
};

export type IkigaiState = {
  dimensions: Record<DimensionKey, Dimension>;
  theme: "light" | "dark";
  history: Snapshot[];
  premium: boolean;
  prefs: PremiumPrefs;
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
    history: [],
    premium: false,
    prefs: {
      palette: "editorial",
      audioEnabled: true,
      paperTexture: true,
    },
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
  state.premium = input.premium === true;
  if (input.prefs && typeof input.prefs === "object") {
    const p = input.prefs as Partial<PremiumPrefs>;
    if (PALETTE_ORDER.includes(p.palette as PaletteKey)) state.prefs.palette = p.palette as PaletteKey;
    if (typeof p.audioEnabled === "boolean") state.prefs.audioEnabled = p.audioEnabled;
    if (typeof p.paperTexture === "boolean") state.prefs.paperTexture = p.paperTexture;
  }
  if (Array.isArray(input.history)) {
    state.history = input.history
      .filter((snap) => snap && typeof snap.at === "number")
      .map((snap) => ({
        at: snap.at,
        note: typeof snap.note === "string" ? snap.note : undefined,
        avgs: coerceRecord(snap.avgs),
        counts: coerceRecord(snap.counts),
      }))
      .sort((a, b) => a.at - b.at);
  }
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

/* ---------- history + warmth ---------- */

function coerceRecord(raw: unknown): Record<DimensionKey, number> {
  const out = { love: 0, good_at: 0, needs: 0, paid_for: 0 } as Record<DimensionKey, number>;
  if (typeof raw !== "object" || raw === null) return out;
  for (const key of DIMENSION_ORDER) {
    const value = Number((raw as Record<string, unknown>)[key]);
    out[key] = Number.isFinite(value) ? value : 0;
  }
  return out;
}

export const HISTORY_LIMIT = 60;
export const HISTORY_LIMIT_PREMIUM = 2000;

export function historyLimit(premium: boolean): number {
  return premium ? HISTORY_LIMIT_PREMIUM : HISTORY_LIMIT;
}

export function snapshotOf(state: IkigaiState, note?: string): Snapshot {
  const avgs = {} as Record<DimensionKey, number>;
  const counts = {} as Record<DimensionKey, number>;
  for (const key of DIMENSION_ORDER) {
    avgs[key] = state.dimensions[key].avg_score;
    counts[key] = state.dimensions[key].items.length;
  }
  return note ? { at: Date.now(), avgs, counts, note } : { at: Date.now(), avgs, counts };
}

export function sameShape(a: Snapshot, b: Snapshot): boolean {
  return DIMENSION_ORDER.every((key) => a.avgs[key] === b.avgs[key] && a.counts[key] === b.counts[key]);
}

/** Rebuild a renderable state from a stored snapshot. */
export function stateFromSnapshot(snap: Snapshot, theme: IkigaiState["theme"]): IkigaiState {
  const state = emptyState();
  state.theme = theme;
  for (const key of DIMENSION_ORDER) {
    state.dimensions[key] = {
      avg_score: snap.avgs[key],
      items: Array.from({ length: snap.counts[key] }, (_, index) => ({
        id: `${key}-hist-${index}`,
        label: "",
        score: Math.round(snap.avgs[key]) || 1,
      })),
    };
  }
  return state;
}

export const JOURNAL_PROMPTS: string[] = [
  "What felt effortless today?",
  "Which entry would you defend to a stranger?",
  "Where did your work meet someone else's need?",
  "What did you avoid, and what did that cost?",
  "Name one thing worth being paid for that you gave away.",
  "What would you keep doing with no audience at all?",
  "Which circle is quietly asking for attention?",
];

export function promptFor(seed: number): string {
  return JOURNAL_PROMPTS[Math.abs(Math.round(seed)) % JOURNAL_PROMPTS.length]!;
}

/**
 * Warmth radiating toward the centre: rises well before circles truly overlap,
 * so progress is visible on the way to alignment.
 */
export function zoneWarmth(state: IkigaiState, zone: ZoneKey): number {
  const [a, b] = ZONES[zone].pair;
  const da = state.dimensions[a];
  const db = state.dimensions[b];
  if (da.items.length === 0 && db.items.length === 0) return 0;
  const reach = radiusFor(da.avg_score) + radiusFor(db.avg_score);
  return clamp01((reach - ADJACENT_DISTANCE * 0.62) / (ADJACENT_DISTANCE * 0.55));
}

export function coreWarmth(state: IkigaiState): number {
  let sum = 0;
  for (const key of DIMENSION_ORDER) {
    const dim = state.dimensions[key];
    if (dim.items.length === 0) continue;
    sum += clamp01(radiusFor(dim.avg_score) / (VENN.offset + 26));
  }
  return clamp01(sum / 4);
}

/* ---------- analysis ---------- */

export function alignmentScore(state: IkigaiState): number {
  const core = ikigaiStrength(state);
  const zones = (Object.keys(ZONES) as ZoneKey[]).map((z) => zoneStrength(state, z));
  const zoneAvg = zones.reduce((a, b) => a + b, 0) / zones.length;
  return Math.round((core * 0.5 + zoneAvg * 0.5) * 100);
}

export function driftAlert(state: IkigaiState): { key: DimensionKey; gap: number } | null {
  const avgs = DIMENSION_ORDER.map((key) => ({ key, avg: state.dimensions[key].avg_score }));
  const max = Math.max(...avgs.map((d) => d.avg));
  const min = Math.min(...avgs.map((d) => d.avg));
  if (max === 0) return null;
  const weakest = avgs.find((d) => d.avg === min)!;
  return { key: weakest.key, gap: Math.round((max - min) * 10) / 10 };
}

export function trendFor(history: Snapshot[], key: DimensionKey): "rising" | "falling" | "steady" {
  if (history.length < 2) return "steady";
  const first = history[0]!.avgs[key];
  const last = history[history.length - 1]!.avgs[key];
  const delta = last - first;
  if (delta > 0.25) return "rising";
  if (delta < -0.25) return "falling";
  return "steady";
}

export function zoneInsightFor(state: IkigaiState): { zone: ZoneKey; strength: number } | null {
  let best: { zone: ZoneKey; strength: number } | null = null;
  for (const key of Object.keys(ZONES) as ZoneKey[]) {
    const s = zoneStrength(state, key);
    if (!best || s > best.strength) best = { zone: key, strength: s };
  }
  return best;
}
