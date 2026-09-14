import { Check, ShieldCheck, Sparkles, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumSettings } from "./PremiumSettings";
import type { PremiumPrefs } from "@/lib/ikigai";

const FEATURES: { title: string; detail: string }[] = [
  { title: "Aesthetic customisation", detail: "Palettes, paper textures and typography that feel like yours." },
  { title: "Premium backgrounds", detail: "Hand-tuned canvases for the diagram and the page." },
  { title: "Audio effects", detail: "Soft tones as circles meet — reflection you can hear." },
  { title: "Unlimited history", detail: "Every snapshot kept, scrubbable across months." },
  { title: "Detailed analysis", detail: "Trends per dimension, drift alerts, alignment reports." },
  { title: "Export & share", detail: "Print, PDF, or a composed image for social — on your terms." },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  premium: boolean;
  prefs: PremiumPrefs;
  onActivate: () => void;
  onPrefsChange: (prefs: PremiumPrefs) => void;
  onAudioPreview: () => void;
};

export function PremiumDialog({ open, onOpenChange, premium, prefs, onActivate, onPrefsChange, onAudioPreview }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <p className="eyebrow text-muted-foreground">Sanctuary</p>
          <DialogTitle className="font-display text-2xl">
            {premium ? "Premium settings" : "Buy your privacy, not a bigger feed"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {premium
              ? "Your premium features are active. Tune the mood, sound and texture below."
              : "No ads, no trackers, no selling of your reflections — ever. Your subscription is what keeps this place quiet and independent. €2.49 a month."}
          </DialogDescription>
        </DialogHeader>

        {premium ? (
          <PremiumSettings prefs={prefs} onChange={onPrefsChange} onAudioPreview={onAudioPreview} />
        ) : (
          <>
            <ul className="mt-1 space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" aria-hidden />
              Data stays on your device by default. Cancel any time; your history remains yours.
            </div>
          </>
        )}

        {premium ? (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Premium is active — enjoy the quiet.
          </p>
        ) : (
          <button
            type="button"
            onClick={onActivate}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-4" aria-hidden />
            Unlock for €2.49 / month
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function PremiumButton({ premium, onClick }: { premium: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border bg-card px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-soft transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {premium ? <Settings className="size-3.5" aria-hidden /> : <Sparkles className="size-3.5" aria-hidden />}
      {premium ? "Premium" : "Upgrade"}
    </button>
  );
}
