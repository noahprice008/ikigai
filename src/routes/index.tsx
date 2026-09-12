import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Moon, Sun } from "lucide-react";
import { STORAGE_KEY, ZONES, normalize, type ZoneKey } from "@/lib/ikigai";
import {
  FAQ,
  OGIMI_HABITS,
  PILLARS,
  VALUE_PROPS,
  ZONE_INSIGHTS,
} from "@/lib/landing-copy";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Discover Your Ikigai — Your Reason for Being" },
      {
        name: "description",
        content:
          "Map your holistic spectrum of purpose: what you love, what you're good at, what the world needs and what you can be paid for — in one calm, living diagram.",
      },
      { property: "og:title", content: "Discover Your Ikigai — Your Reason for Being" },
      {
        property: "og:description",
        content:
          "From your morning coffee to your life's mission, find the balance that makes life worth living.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage;
});

const ZONE_KEYS = Object.keys(ZONES) as ZoneKey[];

function LandingPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [hoveredZone, setHoveredZone] = useState<ZoneKey | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? normalize(JSON.parse(stored)) : null;
      if (parsed) setTheme(parsed.theme);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? normalize(JSON.parse(stored)) : null;
      if (parsed) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, theme: next }));
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="min-h-screen paper-grain">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <p className="eyebrow text-muted-foreground">生き甲斐 · Ikigai</p>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="grid size-10 shrink-0 place-items-center rounded-full border bg-card text-foreground shadow-soft transition-colors hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>

        {/* Hero */}
        <section className="py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl leading-[1.1] sm:text-6xl">
            Discover your Ikigai: your reason for being.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Map your holistic spectrum of purpose. From your morning coffee to your life's mission,
            find the balance that makes life worth living.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-opacity hover:opacity-90"
            >
              Begin your map
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#pillars"
              className="inline-flex items-center rounded-full border bg-card px-6 py-3.5 text-sm font-semibold shadow-soft transition-colors hover:bg-accent"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            15–30 quiet minutes. Nothing leaves your device.
          </p>
        </section>

        {/* Meaning */}
        <section className="grid gap-10 border-t pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <p className="eyebrow text-muted-foreground">The concept</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">A life worth living, in two syllables</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              <span className="text-foreground">Iki (生き)</span> means life, being alive.{" "}
              <span className="text-foreground">Kai (甲斐)</span> means worth, effect, result. Voiced
              together as <em>gai</em>, they name the motivating force that makes life worth living.
            </p>
            <p>
              This map reconciles the western four-circle diagram with the Japanese view of Ikigai as
              a spectrum of small daily joys. Purpose can also be non-social — found in
              self-discipline or personal faith — so start with the small internal joys and let the
              grander structure appear.
            </p>
          </div>
        </section>

        {/* Value */}
        <section className="mt-14 grid gap-5 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => (
            <article key={prop.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <h3 className="text-lg">{prop.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{prop.body}</p>
            </article>
          ))}
        </section>

        {/* Pillars */}
        <section id="pillars" className="scroll-mt-8 pt-20">
          <p className="eyebrow text-muted-foreground">The four pillars</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">Four circles, one centre</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <article
                key={pillar.key}
                className="rounded-2xl border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-full", pillar.swatchClass)} />
                  <h3 className="text-lg">{pillar.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{pillar.definition}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.benefit}
                </p>
                <ul className="mt-4 space-y-1.5 border-t pt-4 text-sm text-muted-foreground">
                  {pillar.prompts.map((prompt) => (
                    <li key={prompt} className="flex gap-2">
                      <span aria-hidden className="text-primary">
                        —
                      </span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* Intersections */}
        <section className="pt-20">
          <p className="eyebrow text-muted-foreground">The intersections</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">
            Three circles out of four still leaves an ache
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Hover or tap each pairing to feel what's missing when one circle stays empty.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ZONE_KEYS.map((key) => {
              const open = hoveredZone === key;
              return (
                <button
                  key={key}
                  type="button"
                  onMouseEnter={() => setHoveredZone(key)}
                  onMouseLeave={() => setHoveredZone((c) => (c === key ? null : c))}
                  onFocus={() => setHoveredZone(key)}
                  onBlur={() => setHoveredZone((c) => (c === key ? null : c))}
                  onClick={() => setHoveredZone((c) => (c === key ? null : key))}
                  aria-expanded={open}
                  className={cn(
                    "rounded-2xl border bg-card p-6 text-left transition-shadow",
                    open ? "shadow-lift" : "shadow-soft",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg">{ZONES[key].label}</h3>
                    <span className="eyebrow text-muted-foreground">
                      {ZONE_INSIGHTS[key].formula}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "grid overflow-hidden text-sm leading-relaxed text-muted-foreground transition-all duration-500",
                      open ? "mt-3 max-h-32 opacity-100" : "max-h-0 opacity-0",
                    )}
                  >
                    {ZONE_INSIGHTS[key].feeling}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Flow */}
        <section className="pt-20">
          <p className="eyebrow text-muted-foreground">The discovery flow</p>
          <h2 className="mt-3 text-2xl sm:text-3xl">One circle at a time</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Write what's true",
                body: "Add short entries to each circle, guided by the prompts. No pressure to be impressive.",
              },
              {
                step: "02",
                title: "Rate one to five",
                body: "Tactile stars fill with warm amber; each circle's average updates the diagram instantly.",
              },
              {
                step: "03",
                title: "Watch the centre warm",
                body: "As the four scores rise and reach parity, the middle begins to glow and breathe.",
              },
            ].map((item) => (
              <li key={item.step} className="rounded-2xl border bg-card p-6 shadow-soft">
                <span className="font-display text-2xl text-primary">{item.step}</span>
                <h3 className="mt-3 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-2xl border border-dashed bg-canvas p-6 text-sm leading-relaxed text-muted-foreground">
            “Warmth is gathering in the middle — the circles are reaching for one another.”
          </p>
        </section>

        {/* FAQ + Ogimi */}
        <section className="grid gap-12 pt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <p className="eyebrow text-muted-foreground">Good to know</p>
            <h2 className="mt-3 text-2xl sm:text-3xl">Questions before you begin</h2>
            <Accordion type="single" collapsible className="mt-6">
              {FAQ.map((entry) => (
                <AccordionItem key={entry.q} value={entry.q}>
                  <AccordionTrigger className="text-left text-base">{entry.q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {entry.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <aside className="rounded-3xl border bg-canvas p-6 shadow-soft sm:p-8">
            <p className="eyebrow text-muted-foreground">The Okinawa lifestyle</p>
            <h2 className="mt-3 text-2xl">10 habits of Ogimi</h2>
            <ol className="mt-5 space-y-4">
              {OGIMI_HABITS.map((habit, index) => (
                <li key={habit.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <span className="font-display text-sm text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{habit.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {habit.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </section>

        {/* Closing CTA */}
        <section className="mt-20 rounded-3xl border bg-card p-8 text-center shadow-soft sm:p-14">
          <h2 className="text-2xl sm:text-3xl">Begin the journey of being busy with what you love</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your map lives on your own device, saves itself as you type, and grows with you.
          </p>
          <Link
            to="/map"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-opacity hover:opacity-90"
          >
            Open my Ikigai map
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
