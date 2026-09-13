import { useCallback, useEffect, useRef } from "react";

const CHORDS: Record<string, number[]> = {
  love: [196.0, 246.94], // G3 + B3
  good_at: [246.94, 293.66], // B3 + D4
  needs: [293.66, 349.23], // D4 + F4
  paid_for: [349.23, 392.0], // F4 + G4
  align: [196.0, 293.66, 392.0], // G major triad
  glow: [261.63, 329.63, 392.0, 523.25], // C major 7
};

export function useAudio(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const resumeRef = useRef<() => void>();

  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        ctxRef.current = new Ctx({});
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
    };
    resumeRef.current = unlock;
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const play = useCallback(
    (name: keyof typeof CHORDS, intensity = 0.5) => {
      if (!enabled) return;
      resumeRef.current?.();
      const ctx = ctxRef.current;
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = CHORDS[name];
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, now);
      master.gain.linearRampToValueAtTime(0.0008 * intensity, now + 0.08);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      master.connect(ctx.destination);

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 / freqs.length, now + 0.05 + index * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + index * 0.05);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 2);
      });
    },
    [enabled],
  );

  return { play };
}
