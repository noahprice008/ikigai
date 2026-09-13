import { Palette, Volume2, VolumeX, Layers } from "lucide-react";
import {
  PALETTE_META,
  PALETTE_ORDER,
  type PaletteKey,
  type PremiumPrefs,
} from "@/lib/ikigai";
import { cn } from "@/lib/utils";

type Props = {
  prefs: PremiumPrefs;
  onChange: (prefs: PremiumPrefs) => void;
};

export function PremiumSettings({ prefs, onChange }: Props) {
  const set = <K extends keyof PremiumPrefs>(key: K, value: PremiumPrefs[K]) => {
    onChange({ ...prefs, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Palette className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Palette</h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose the colour mood for your diagram.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PALETTE_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => set("palette", key)}
              className={cn(
                "rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent",
                prefs.palette === key && "border-primary ring-1 ring-primary",
              )}
            >
              <span className="block text-sm font-semibold">{PALETTE_META[key].name}</span>
              <span className="block text-xs text-muted-foreground">
                {PALETTE_META[key].description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          {prefs.audioEnabled ? (
            <Volume2 className="mt-0.5 size-4 text-primary" />
          ) : (
            <VolumeX className="mt-0.5 size-4 text-muted-foreground" />
          )}
          <div>
            <h3 className="text-sm font-semibold">Audio ambience</h3>
            <p className="text-xs text-muted-foreground">
              Soft tones when scores change and circles align.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => set("audioEnabled", !prefs.audioEnabled)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            prefs.audioEnabled ? "bg-primary" : "bg-muted",
          )}
          aria-pressed={prefs.audioEnabled}
        >
          <span
            className={cn(
              "inline-block size-4 rounded-full bg-card transition-transform",
              prefs.audioEnabled ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-2xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <Layers className="mt-0.5 size-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Paper texture</h3>
            <p className="text-xs text-muted-foreground">
              Subtle grain across the page background.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => set("paperTexture", !prefs.paperTexture)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            prefs.paperTexture ? "bg-primary" : "bg-muted",
          )}
          aria-pressed={prefs.paperTexture}
        >
          <span
            className={cn(
              "inline-block size-4 rounded-full bg-card transition-transform",
              prefs.paperTexture ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}
