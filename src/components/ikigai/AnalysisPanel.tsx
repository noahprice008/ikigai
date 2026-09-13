import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  AlertCircle,
  Target,
  Sparkles,
} from "lucide-react";
import {
  DIMENSION_META,
  DIMENSION_ORDER,
  alignmentScore,
  driftAlert,
  ikigaiStrength,
  trendFor,
  type IkigaiState,
  type Snapshot,
} from "@/lib/ikigai";
import { cn } from "@/lib/utils";

type Props = {
  state: IkigaiState;
  history: Snapshot[];
};

function TrendIcon({ trend }: { trend: "rising" | "falling" | "steady" }) {
  if (trend === "rising") return <ArrowUpRight className="size-3.5 text-love" />;
  if (trend === "falling") return <ArrowDownRight className="size-3.5 text-paid-for" />;
  return <Minus className="size-3.5 text-muted-foreground" />;
}

export function AnalysisPanel({ state, history }: Props) {
  const score = useMemo(() => alignmentScore(state), [state]);
  const drift = useMemo(() => driftAlert(state), [state]);
  const core = ikigaiStrength(state);

  const filled = DIMENSION_ORDER.filter((k) => state.dimensions[k].items.length > 0).length;
  const ready = filled === 4;

  return (
    <section className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">Detailed analysis</p>
          <h2 className="mt-2 text-2xl">Your alignment report</h2>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl leading-none">{ready ? score : "—"}</div>
          <p className="eyebrow mt-1 text-muted-foreground">alignment score</p>
        </div>
      </header>

      {!ready ? (
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Add at least one entry to each of the four circles to generate your alignment report.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {DIMENSION_ORDER.map((key) => {
              const dim = state.dimensions[key];
              const trend = trendFor(history, key);
              return (
                <div key={key} className="rounded-2xl border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("size-2 rounded-full", DIMENSION_META[key].swatchClass)} />
                      <span className="text-sm font-semibold">{DIMENSION_META[key].title}</span>
                    </div>
                    <TrendIcon trend={trend} />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-2xl leading-none">{dim.avg_score.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">avg · {dim.items.length} entries</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {drift && (
              <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-background/40 p-4">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Drift alert</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {DIMENSION_META[drift.key].title} is trailing by {drift.gap.toFixed(1)} points.
                    Small experiments there could bring the circles back into balance.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-background/40 p-4">
              <Target className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">Centre status</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {core > 0.6
                    ? "All four circles hold the centre — your Ikigai is steady."
                    : core > 0
                      ? "The centre is warm. Keep nudging the weakest circle closer."
                      : "The centre is still forming. Add more entries to see overlap."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed bg-background/40 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold">Reflection note</p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {score >= 75
                ? "Your map shows strong alignment. The work now is to protect it from overcommitment."
                : score >= 50
                  ? "You have clear anchors. Look for one activity that sits in two high-scoring circles."
                  : "Let the lowest-scoring circle guide your next experiment. Even a small move changes the centre."}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
