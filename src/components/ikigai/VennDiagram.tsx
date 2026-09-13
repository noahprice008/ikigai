import React from "react";
import {
  CIRCLE_POSITIONS,
  DIMENSION_META,
  DIMENSION_ORDER,
  VENN,
  ZONES,
  coreWarmth,
  ikigaiStrength,
  radiusFor,
  zoneStrength,
  zoneWarmth,
  type DimensionKey,
  type IkigaiState,
  type ZoneKey,
} from "@/lib/ikigai";
import { ZONE_INSIGHTS } from "@/lib/landing-copy";

type Props = {
  state: IkigaiState;
  focused: DimensionKey | null;
};

const ZONE_KEYS = Object.keys(ZONES) as ZoneKey[];

export const VennDiagram = React.forwardRef<SVGSVGElement, Props>(function VennDiagram({ state, focused }, ref) {
  const core = ikigaiStrength(state);
  const warmth = coreWarmth(state);

  return (
    <svg
      ref={ref}
      viewBox={`-30 -46 ${VENN.size + 60} ${VENN.size + 92}`}
      className="h-auto w-full max-w-[34rem] select-none overflow-visible"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      role="img"
      aria-label="Ikigai Venn diagram reflecting your current scores"
    >
      <defs>
        {/* warmth radiating from the centre outwards */}
        <radialGradient id="ikigai-warmth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ikigai)" stopOpacity="0.9" />
          <stop offset="45%" stopColor="var(--ikigai)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--ikigai)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ikigai-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--ikigai)" stopOpacity="0.98" />
          <stop offset="55%" stopColor="var(--ikigai)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--ikigai)" stopOpacity="0" />
        </radialGradient>
        <filter
          id="ikigai-glow"
          x="-60%"
          y="-60%"
          width="220%"
          height="220%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {DIMENSION_ORDER.map((key) => (
          <clipPath key={key} id={`clip-${key}`}>
            <circle
              cx={CIRCLE_POSITIONS[key].cx}
              cy={CIRCLE_POSITIONS[key].cy}
              r={radiusFor(state.dimensions[key].avg_score)}
            />
          </clipPath>
        ))}



      </defs>

      {/* pre-overlap heat: warmth reaches inward long before the circles meet */}
      {warmth > 0 && (
        <circle
          cx={VENN.center}
          cy={VENN.center}
          r={48 + warmth * 78}
          fill="url(#ikigai-warmth)"
          opacity={warmth * 0.5}
          className={warmth > 0.5 ? "ikigai-breathe" : undefined}
          style={{ transition: "r 600ms cubic-bezier(.22,.9,.28,1), opacity 600ms" }}
        />
      )}

      <g className="[mix-blend-mode:multiply] dark:[mix-blend-mode:screen]">
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
              strokeWidth={focused === key ? 2.2 : 1.1}
              strokeDasharray={empty ? "3 5" : undefined}
              vectorEffect="non-scaling-stroke"
              style={{
                transition:
                  "r 500ms cubic-bezier(.22,.9,.28,1), fill-opacity 300ms, stroke-opacity 300ms, stroke-width 300ms",
              }}
            />
          );
        })}

        {/* intersection lenses — soft, unsaturated overlap with a slow heartbeat */}
        {ZONE_KEYS.map((zoneKey) => {
          const zone = ZONES[zoneKey];
          const [a, b] = zone.pair;
          const strength = zoneStrength(state, zoneKey);
          if (strength <= 0) return null;
          const related = focused === null || zone.pair.includes(focused);
          return (
            <g key={zoneKey} clipPath={`url(#clip-${a})`}>
              <circle
                cx={CIRCLE_POSITIONS[b].cx}
                cy={CIRCLE_POSITIONS[b].cy}
                r={radiusFor(state.dimensions[b].avg_score)}
                fill={DIMENSION_META[b].colorVar}
                fillOpacity="var(--venn-fill-opacity)"
                opacity={related ? 1 : 0.35}
                className="ikigai-heartbeat"
                style={{
                  animationDelay: `${ZONE_KEYS.indexOf(zoneKey) * 0.15}s`,
                  transition: "r 500ms cubic-bezier(.22,.9,.28,1), opacity 400ms",
                }}
              />
            </g>
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
        </g>
      )}

      {core > 0 && (
        <text
          x={VENN.center}
          y={VENN.center + 4}
          textAnchor="middle"
          className="fill-foreground font-display text-[15px] tracking-tight"
          opacity={0.5 + core * 0.5}
        >
          Ikigai
        </text>
      )}

      {ZONE_KEYS.map((zoneKey) => {
        const zone = ZONES[zoneKey];
        const strength = zoneStrength(state, zoneKey);
        const w = zoneWarmth(state, zoneKey);
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
              opacity: (0.18 + Math.max(strength, w * 0.8) * 0.7) * (related ? 1 : 0.35),
              transition: "opacity 400ms",
            }}
          >
            <title>{`${zone.label} (${ZONE_INSIGHTS[zoneKey].formula}) — ${ZONE_INSIGHTS[zoneKey].feeling}`}</title>
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
});

export function DiagramCaption({ state }: { state: IkigaiState }) {
  const core = ikigaiStrength(state);
  const warmth = coreWarmth(state);
  if (core <= 0) {
    return (
      <p className="max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
        {warmth > 0.35
          ? "Warmth is gathering in the middle — the circles are reaching for one another."
          : "Add a few entries to each of the four dimensions. The centre warms as your averages rise."}
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
