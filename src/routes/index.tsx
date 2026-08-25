import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { DimensionPanel } from "@/components/ikigai/DimensionPanel";
import { DiagramCaption, VennDiagram } from "@/components/ikigai/VennDiagram";
import {
  DIMENSION_ORDER,
  STORAGE_KEY,
  average,
  normalize,
  seedState,
  type DimensionKey,
  type IkigaiState,
} from "@/lib/ikigai";

export const Route = createFileRoute("/")({
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
  }, [state.theme]);

  const mutate = useCallback(
    (key: DimensionKey, updater: (items: IkigaiState["dimensions"][DimensionKey]["items"]) => IkigaiState["dimensions"][DimensionKey]["items"]) => {
      setState((prev) => {
        const items = updater(prev.dimensions[key].items);
        return {
          ...prev,
          dimensions: {
            ...prev.dimensions,
            [key]: { items, avg_score: average(items) },
          },
        };
      });
    },
    [],
  );

  return (
    <main className="min-h-screen paper-grain">
      <div className="mx-auto max-w-[104rem] px-5 pb-16 pt-8 sm:px-8 lg:px-12">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-8 sm:items-center">
          <div className="min-w-0">
            <p className="eyebrow text-muted-foreground">A quiet place to think</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">My Ikigai Map</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Write what's true, score it one to five, and watch the four circles find each other.
              Everything saves itself.
            </p>
          </div>
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
          </div>

          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <div className="flex flex-col items-center gap-5 rounded-3xl border bg-canvas px-3 py-8 shadow-soft sm:px-8">
                <VennDiagram state={state} focused={focused} />
                <DiagramCaption state={state} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
