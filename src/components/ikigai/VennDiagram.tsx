import {
  CIRCLE_POSITIONS,
  DIMENSION_META,
  DIMENSION_ORDER,
  VENN,
  ZONES,
  ikigaiStrength,
  radiusFor,
  zoneStrength,
  type DimensionKey,
  type IkigaiState,
  type ZoneKey,
} from "@/lib/ikigai";

type Props = {
  state: IkigaiState;
  focused: DimensionKey | null;
};

const LABEL_OFFSET = 214;

const OUTER_LABELS: Record<DimensionKey, { x: number; y: number; anchor: "middle" }> = {
  love: { x: VENN.center, y: VENN.center - LABEL_OFFSET + 4, anchor: "middle" },
  good_at: { x: VENN.center, y: VENN.center - LABEL_OFFSET + 24, anchor: "middle" },
  needs: { x: VENN.center, y: VENN.center + LABEL_OFFSET - 12, anchor: "middle" },
  paid_for: { x: VENN.center, y: VENN.center + LABEL_OFFSET + 8, anchor: "middle" },
};

export function VennDiagram({ state, focused }: Props) {
  const core = ikigaiStrength(state);

  return (
    <svg
      viewBox={`-30 -46 ${VENN.size + 60} ${VENN.size + 92}`}
      className="h-auto w-full max-w-[34rem] select-none overflow-visible"
      role="img"
      aria-label="Ikigai Venn diagram reflecting your current scores"
    >
      <defs>
        <radialGradient id="ikigai-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ikigai)" stopOpacity="0.95" />
          <stop offset="55%" stopColor="var(--ikigai)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--ikigai)" stopOpacity="0" />
        </radialGradient>
        <filter id="ikigai-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g style={{ mixBlendMode: "multiply" }} className="dark:[mix-blend-mode:screen]">
        {DIMENSION_ORDER.map((key) => {
          const dim = state.dimensions[key];
          const pos = CIRCLE_POSITIONS[key];
          const r = radiusFor(dim.avg_score);
          const dimmed = focused !== null && focused !== key;
          const empty = dim.items.length === 0;
          return (
            <circle
              key={key}
              cx={pos.cx}
              cy={pos.cy}
              r={r}
              fill={DIMENSION_META[key].colorVar}
              fillOpacity={empty ? 0.07 : dimmed ? 0.12 : "var(--venn-fill-opacity)"}
              stroke={DIMENSION_META[key].colorVar}
              strokeOpacity={empty ? 0.3 : dimmed ? 0.28 : "var(--venn-stroke-opacity)"}
              strokeWidth={focused === key ? 2.4 : 1.2}
              strokeDasharray={empty ? "3 5" : undefined}
              style={{ transition: "r 500ms cubic-bezier(.22,.9,.28,1), fill-opacity 300ms, stroke-opacity 300ms, stroke-width 300ms" }}
            />
          );
        })}
      </g>

      {core > 0 && (
        <g
          className={core > 0.35 ? "ikigai-breathe" : undefined}
          style={{ transition: "opacity 500ms" }}
          opacity={0.35 + core * 0.65}
        >
          <circle
            cx={VENN.center}
            cy={VENN.center}
            r={26 + core * 16}
            fill="url(#ikigai-core)"
            filter="url(#ikigai-glow)"
          />
          <text
            x={VENN.center}
            y={VENN.center + 4}
            textAnchor="middle"
            className="fill-foreground font-display text-[15px] tracking-tight"
          >
            Ikigai
          </text>
        </g>
      )}

      {(Object.keys(ZONES) as ZoneKey[]).map((zoneKey) => {
        const zone = ZONES[zoneKey];
        const strength = zoneStrength(state, zoneKey);
        const related = focused === null || zone.pair.includes(focused);
        return (
          <text
            key={zoneKey}
            x={zone.x}
            y={zone.y}
            textAnchor="middle"
            className="fill-foreground text-[10.5px] font-semibold uppercase"
            style={{
              letterSpacing: "0.14em",
              opacity: (0.18 + strength * 0.7) * (related ? 1 : 0.35),
              transition: "opacity 400ms",
            }}
          >
            {zone.label}
          </text>
        );
      })}

      <g>
        {DIMENSION_ORDER.map((key) => {
          const pos = CIRCLE_POSITIONS[key];
          const r = radiusFor(state.dimensions[key].avg_score);
          const dx = pos.cx - VENN.center;
          const dy = pos.cy - VENN.center;
          const len = Math.hypot(dx, dy) || 1;
          const lx = pos.cx + (dx / len) * (r + 20);
          const ly = pos.cy + (dy / len) * (r + 20) + (dy > 0 ? 8 : dy < 0 ? -2 : 4);
          const dim = state.dimensions[key];
          return (
            <g
              key={key}
              opacity={focused === null || focused === key ? 1 : 0.4}
              style={{ transition: "opacity 300ms" }}
            >
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                className="fill-foreground text-[11.5px] font-semibold"
                style={{ letterSpacing: "0.02em", transition: "all 500ms" }}
              >
                {DIMENSION_META[key].title}
              </text>
              <text
                x={lx}
                y={ly + 15}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
                style={{ transition: "all 500ms" }}
              >
                {dim.items.length === 0 ? "no entries yet" : `avg ${dim.avg_score.toFixed(1)}`}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function DiagramCaption({ state }: { state: IkigaiState }) {
  const core = ikigaiStrength(state);
  if (core <= 0) {
    return (
      <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        Add a few entries to each of the four dimensions. The centre only lights up when all four
        circles genuinely reach one another.
      </p>
    );
  }
  return (
    <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
      {core > 0.6
        ? "All four circles hold the centre — your Ikigai is glowing steadily."
        : "The four circles have just met in the middle. Keep refining."}
    </p>
  );
}
