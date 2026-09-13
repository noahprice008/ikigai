import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { DimensionPanel } from "@/components/ikigai/DimensionPanel";
import { DiagramCaption, VennDiagram } from "@/components/ikigai/VennDiagram";
import { PremiumButton, PremiumDialog } from "@/components/ikigai/PremiumDialog";
import { TimelineSlider } from "@/components/ikigai/TimelineSlider";
import { AnalysisPanel } from "@/components/ikigai/AnalysisPanel";
import { ExportMenu } from "@/components/ikigai/ExportMenu";
import { useAudio } from "@/hooks/use-audio";
import {
  DIMENSION_ORDER,
  STORAGE_KEY,
  alignmentScore,
  average,
  historyLimit,
  normalize,
  sameShape,
  seedState,
  snapshotOf,
  type DimensionKey,
  type IkigaiState,
  type PremiumPrefs,
} from "@/lib/ikigai";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "My Ikigai Map — A Live Reflection Diagram" },
      {
        name: "description",
        content:
          "A calm, single-page reflection tool: rate what you love, what you're good at, what the world needs and what you can be paid for, and watch your Ikigai diagram respond live.",
      },
      { property: "og:title", content: "My Ikigai Map — A Live Reflection Diagram" },
      {
        property: "og:description",
        content:
          "Four dimensions, one living Venn diagram. Reflect on your Ikigai with a warm, quiet tool that saves itself as you type.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IkigaiPage,
});

function IkigaiPage() {
  const [state, setState] = useState<IkigaiState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);
  const [focused, setFocused] = useState<DimensionKey | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [cursor, setCursor] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [premiumOpen, setPremiumOpen] = useState(false);
  const noteRef = useRef(note);
  const svgRef = useRef<SVGSVGElement>(null);
  noteRef.current = note;

  const { play } = useAudio(state.premium && state.prefs.audioEnabled);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = normalize(JSON.parse(stored));
        if (parsed) setState(parsed);
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    document.documentElement.setAttribute("data-palette", state.prefs.palette);
    document.documentElement.classList.toggle("paper-texture-off", !state.prefs.paperTexture);
  }, [state.theme, state.prefs.palette, state.prefs.paperTexture]);

  const prevAlignmentRef = useRef(0);
  useEffect(() => {
    prevAlignmentRef.current = alignmentScore(state);
  }, []);

  /* record a snapshot once edits settle */
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      setState((prev) => {
        const snap = snapshotOf(prev, noteRef.current.trim() || undefined);
        const last = prev.history[prev.history.length - 1];
        if (last && sameShape(last, snap) && (last.note ?? "") === (snap.note ?? "")) return prev;
        const limit = historyLimit(prev.premium);
        return { ...prev, history: [...prev.history, snap].slice(-limit) };
      });
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [state.dimensions, note, hydrated]);

  const mutate = useCallback(
    (
      key: DimensionKey,
      updater: (
        items: IkigaiState["dimensions"][DimensionKey]["items"],
      ) => IkigaiState["dimensions"][DimensionKey]["items"],
    ) => {
      setCursor(null);
      setState((prev) => {
        const items = updater(prev.dimensions[key].items);
        const next = {
          ...prev,
          dimensions: {
            ...prev.dimensions,
            [key]: { items, avg_score: average(items) },
          },
        };
        const score = alignmentScore(next);
        const prevScore = prevAlignmentRef.current;
        if (score > prevScore + 3) {
          play("align", Math.min(1, (score - prevScore) / 10));
        } else {
          play(key, 0.6);
        }
        prevAlignmentRef.current = score;
        return next;
      });
    },
    [play],
  );

  const updatePrefs = useCallback((prefs: PremiumPrefs) => {
    setState((prev) => ({ ...prev, prefs }));
  }, []);

  const viewedState = useMemo(() => {
    const snap = cursor === null ? undefined : state.history[cursor];
    return snap ? { ...state, dimensions: snap.avgs } : state;
  }, [cursor, state]);
  const viewingPast = cursor !== null && state.history[cursor] !== undefined;

  return (
    <main className="min-h-screen paper-grain">
      <div className="mx-auto max-w-[104rem] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-8 sm:items-center">
          <div className="min-w-0">
            <Link to="/" className="eyebrow text-muted-foreground transition-colors hover:text-foreground">
              ← A quiet place to think
            </Link>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">My Ikigai Map</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Write what's true, score it one to five, and watch the four circles find each other.
              Everything saves itself.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <PremiumButton premium={state.premium} onClick={() => setPremiumOpen(true)} />
            <button
              type="button"
              onClick={() =>
                setState((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" }))
              }
              aria-label={`Switch to ${state.theme === "dark" ? "light" : "dark"} mode`}
              className="grid size-10 shrink-0 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-colors hover:bg-accent"
            >
              {state.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="order-2 flex flex-col gap-5 lg:order-1">
            {DIMENSION_ORDER.map((key) => (
              <DimensionPanel
                key={key}
                dimensionKey={key}
                dimension={state.dimensions[key]}
                focused={focused === key}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused((current) => (current === key ? null : current))}
                onAdd={(label, score) =>
                  mutate(key, (items) => [
                    ...items,
                    { id: `${key}-${Date.now()}-${items.length}`, label, score },
                  ])
                }
                onScore={(id, score) =>
                  mutate(key, (items) =>
                    items.map((item) => (item.id === id ? { ...item, score } : item)),
                  )
                }
                onLabel={(id, label) =>
                  mutate(key, (items) =>
                    items.map((item) => (item.id === id ? { ...item, label } : item)),
                  )
                }
                onRemove={(id) => mutate(key, (items) => items.filter((item) => item.id !== id))}
              />
            ))}

            {state.premium && (
              <div className="no-print">
                <AnalysisPanel state={state} history={state.history} />
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <div className="flex flex-col items-center gap-5 rounded-3xl border bg-canvas px-3 py-8 shadow-soft sm:px-8">
                {viewingPast && (
                  <p className="eyebrow text-muted-foreground">Looking back</p>
                )}
                <VennDiagram state={viewedState} focused={viewingPast ? null : focused} ref={svgRef} />
                <DiagramCaption state={viewedState} />
                {state.premium && (
                  <div className="no-print w-full max-w-sm">
                    <ExportMenu svgRef={svgRef} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <TimelineSlider
          open={timelineOpen}
          onOpenChange={setTimelineOpen}
          history={state.history}
          theme={state.theme}
          cursor={cursor}
          onCursor={setCursor}
          note={note}
          onNote={setNote}
          premium={state.premium}
          onUpgrade={() => setPremiumOpen(true)}
        />
      </div>

      <PremiumDialog
        open={premiumOpen}
        onOpenChange={setPremiumOpen}
        premium={state.premium}
        prefs={state.prefs}
        onActivate={() => {
          setState((prev) => ({ ...prev, premium: true }));
          setPremiumOpen(false);
        }}
        onPrefsChange={updatePrefs}
      />
    </main>
  );
}
