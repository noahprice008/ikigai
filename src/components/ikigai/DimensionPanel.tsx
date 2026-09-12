import { useState } from "react";
import { Plus, X } from "lucide-react";
import { DIMENSION_META, type Dimension, type DimensionKey } from "@/lib/ikigai";
import { cn } from "@/lib/utils";

type Props = {
  dimensionKey: DimensionKey;
  dimension: Dimension;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onAdd: (label: string, score: number) => void;
  onScore: (id: string, score: number) => void;
  onLabel: (id: string, label: string) => void;
  onRemove: (id: string) => void;
};

const SCORES = [1, 2, 3, 4, 5];

export function DimensionPanel({
  dimensionKey,
  dimension,
  focused,
  onFocus,
  onBlur,
  onAdd,
  onScore,
  onLabel,
  onRemove,
}: Props) {
  const meta = DIMENSION_META[dimensionKey];
  const [draft, setDraft] = useState("");
  const [draftScore, setDraftScore] = useState(3);

  const submit = () => {
    const label = draft.trim();
    if (!label) return;
    onAdd(label, draftScore);
    setDraft("");
    setDraftScore(3);
  };

  return (
    <section
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocusCapture={onFocus}
      onBlurCapture={onBlur}
      className={cn(
        "rounded-2xl border bg-card p-5 transition-shadow duration-300 sm:p-6",
        focused ? "shadow-lift" : "shadow-soft",
      )}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2.5 shrink-0 rounded-full", meta.swatchClass)} />
            <h2 className="truncate text-lg font-semibold sm:text-xl">{meta.title}</h2>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{meta.question}</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-2xl leading-none">
            {dimension.items.length === 0 ? "—" : dimension.avg_score.toFixed(1)}
          </div>
          <div className="eyebrow mt-1 text-muted-foreground">avg</div>
        </div>
      </header>

      <ul className="mt-5 space-y-2">
        {dimension.items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 sm:gap-3"
          >
            <input
              value={item.label}
              onChange={(event) => onLabel(item.id, event.target.value)}
              aria-label="Item name"
              className="min-w-0 truncate border-0 border-b border-transparent bg-transparent text-sm outline-none transition-colors focus:border-ring"
            />
            <div className="flex shrink-0 items-center gap-1.5">
              <ScoreDots
                value={item.score}
                color={meta.colorVar}
                onChange={(score) => onScore(item.id, score)}
                label={item.label}
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.label}`}
                className="ml-1 grid size-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
        {dimension.items.length === 0 && (
          <li className="rounded-xl border border-dashed px-3 py-3 text-sm text-muted-foreground">
            Nothing here yet — add your first note below.
          </li>
        )}
      </ul>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t pt-4 sm:gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          placeholder={meta.placeholder}
          aria-label={`Add to ${meta.title}`}
          className="min-w-0 rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring"
        />
        <div className="flex shrink-0 items-center gap-2">
          <ScoreDots
            value={draftScore}
            color={meta.colorVar}
            onChange={setDraftScore}
            label="new item"
          />
          <button
            type="button"
            onClick={submit}
            aria-label={`Add item to ${meta.title}`}
            className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ScoreDots({
  value,
  onChange,
  label,
}: {
  value: number;
  color: string;
  onChange: (score: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label={`Score for ${label}`}>
      {SCORES.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          aria-label={`Score ${score} of 5 for ${label}`}
          aria-pressed={value === score}
          className="grid size-5 place-items-center transition-transform hover:scale-125"
        >
          <Star
            className="size-4"
            style={{
              fill: score <= value ? "var(--ikigai)" : "transparent",
              color: score <= value ? "var(--ikigai)" : "var(--border)",
              transition: "fill 200ms, color 200ms",
            }}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
