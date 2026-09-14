import { useMemo } from "react";
import { ChevronDown, History, Lock } from "lucide-react";
import {
  DIMENSION_ORDER,
  coreWarmth,
  ikigaiStrength,
  promptFor,
  stateFromSnapshot,
  type IkigaiState,
  type Snapshot,
} from "@/lib/ikigai";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FREE_WINDOW = 7;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: Snapshot[];
  theme: IkigaiState["theme"];
  /** index into history, or null for "now" */
  cursor: number | null;
  onCursor: (index: number | null) => void;
  note: string;
  onNote: (note: string) => void;
  premium: boolean;
  onUpgrade: () => void;
};

function formatWhen(at: number): string {
  return new Date(at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TimelineSlider({
  open,
  onOpenChange,
  history,
  theme,
  cursor,
  onCursor,
  note,
  onNote,
  premium,
  onUpgrade,
}: Props) {
  const locked = !premium && history.length > FREE_WINDOW;
  const visible = useMemo(
    () => (locked ? history.slice(history.length - FREE_WINDOW) : history),
    [history, locked],
  );
  const offset = history.length - visible.length;

  const spark = useMemo(
    () =>
      visible.map((snap) => {
        const rebuilt = stateFromSnapshot(snap, theme);
        return Math.max(ikigaiStrength(rebuilt), coreWarmth(rebuilt) * 0.9);
      }),
    [visible, theme],
  );

  const maxIndex = Math.max(visible.length - 1, 0);
  const sliderValue = cursor === null ? maxIndex + 1 : Math.max(cursor - offset, 0);
  const active = cursor === null ? null : history[cursor];

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="mt-10">
      <div className="flex items-center justify-center">
        <CollapsibleTrigger className="group inline-flex items-center gap-2 rounded-full border bg-card/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground">
          <History className="size-3.5" />
          Timeline
          <ChevronDown
            className={cn("size-3.5 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="mx-auto mt-5 max-w-3xl rounded-3xl border bg-card/80 p-5 shadow-soft sm:p-7">
          {history.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Your reflections are recorded quietly as you edit. Come back later to scrub through them.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                <p className="min-w-0 truncate text-sm font-semibold">
                  {active ? formatWhen(active.at) : "Now — live reflection"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {history.length} snapshot{history.length === 1 ? "" : "s"}
                </p>
              </div>

              <svg
                viewBox="0 0 100 26"
                preserveAspectRatio="none"
                shapeRendering="geometricPrecision"
                className="mt-4 h-14 w-full"
                aria-hidden
              >
                <polyline
                  points={spark
                    .map((v, i) => `${(i / Math.max(spark.length - 1, 1)) * 100},${24 - v * 22}`)
                    .join(" ")}
                  fill="none"
                  stroke="var(--ikigai)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {spark.map((v, i) => (
                  <circle
                    key={i}
                    cx={(i / Math.max(spark.length - 1, 1)) * 100}
                    cy={24 - v * 22}
                    r={sliderValue === i ? 1.6 : 0.9}
                    fill="var(--ikigai)"
                    opacity={sliderValue === i ? 1 : 0.5}
                  />
                ))}
              </svg>

              <Slider
                value={[sliderValue]}
                min={0}
                max={maxIndex + 1}
                step={1}
                onValueChange={([value]) =>
                  onCursor(value === undefined || value > maxIndex ? null : value + offset)
                }
                aria-label="Scrub through your reflection history"
                className="mt-2"
              />
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                <span className="truncate">{visible[0] ? formatWhen(visible[0].at) : "start"}</span>
                <span>now</span>
              </div>

              {active && (
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  {DIMENSION_ORDER.map((key) => (
                    <div key={key} className="rounded-xl border bg-background/50 px-3 py-2">
                      <dt className="text-muted-foreground">{key.replace("_", " ")}</dt>
                      <dd className="font-semibold">{active.avgs[key].toFixed(1)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-5 rounded-2xl border border-dashed bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Journal prompt
                </p>
                <p className="mt-1 font-display text-base">
                  {promptFor(active ? active.at / 60000 : history.length)}
                </p>
                {active ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {active.note || "No note kept for this moment."}
                  </p>
                ) : (
                  <Textarea
                    value={note}
                    onChange={(event) => onNote(event.target.value)}
                    rows={2}
                    placeholder="A line for your future self…"
                    className="mt-3 resize-none bg-card"
                  />
                )}
              </div>

              {locked && (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-dashed px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Lock className="size-3.5" />
                  {history.length - FREE_WINDOW} earlier snapshots kept privately — unlock full history
                </button>
              )}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
