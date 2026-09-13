# Ikigai

"Build a single-page Ikigai reflection app. Left pane (stacks above on mobile): four sections — Love, Good At, Needs, Paid For — each lets the user add short text items with a 1–5 score. Right pane: an SVG four-circle Venn diagram where each circle's size is driven by the average score of its section's items, with a fifth glowing zone in the center that only appears when all four circles substantially overlap. All updates happen live with no save button. Include a light/dark mode toggle affecting the whole UI including the SVG colors. Persist all data in localStorage. Visual style: warm, editorial, calm — not a corporate dashboard. Mobile-first responsive design." My Ikigai Map — Lovable Build Brief (MVP)

1. What this app is

A single-page reflection tool that turns the classic four-circle Ikigai Venn diagram into a live, reactive visualization. As the user rates items in four life dimensions, the corresponding circle grows/shrinks and the overlaps light up — including a fifth zone, the central "Ikigai," which only appears when all four circles genuinely overlap.

Tone: warm and editorial, not a corporate dashboard. This is a tool for quiet reflection, not a sales analytics panel.

2. Core interaction loop (build this first, and build it well)

Four dimensions: Love (what you love), Good At (what you're good at), Needs (what the world needs), Paid For (what you can be paid for).

Each dimension has a short list of user-added items, each scored 1–5.

avg_score for a dimension = mean of its items' scores. That single number drives that dimension's circle radius in the SVG. No separate "weight" field — one number, one meaning.

Everything is live: adding/editing/removing an item or changing a score updates the SVG immediately, no save button, no page refresh.

The five interactive zones — Passion (Love ∩ Good At), Mission (Love ∩ Needs), Profession (Good At ∩ Paid For), Vocation (Needs ∩ Paid For), and the central Ikigai (all four) — should visually respond (e.g. glow/opacity shift) as their contributing circles change.

3. Layout

Desktop: dual-pane split screen. Left = input dashboard (four dimension modules, each with an item list + 1–5 score input). Right = the SVG Venn diagram, always visible.

Mobile: stacks vertically — input fields above the SVG canvas, so the user still sees the diagram react as they edit. Design and test mobile as a first-class layout, not an afterthought.

Hovering/focusing an input dimension highlights its circle and related overlaps on the diagram (nice-to-have if time allows within MVP; don't let it block shipping the core loop).

4. Visual & UX direction

Warm, editorial aesthetic — think a calm reflection tool, not a metrics dashboard. Considered typography, soft color palette, generous whitespace.

Light/dark mode toggle, applied consistently across both panes and the SVG (circle colors/opacities need to hold up in both themes).

UI/UX polish is a top priority for this build — favor a small number of well-designed screens/states over a large number of rough ones.

5. Data & persistence

Client-side only. No backend, no accounts.

Persist state in localStorage so a user's map survives a refresh/return visit.

Data shape (simplified for MVP — no weight field, no Past/journaling module, no Inoue tags yet):

json

{
  "dimensions": {
    "love": { "items": [{ "id": "1", "label": "System design", "score": 5 }], "avg_score": 5 },
    "good_at": { "items": [{ "id": "1", "label": "Technical writing", "score": 4 }], "avg_score": 4 },
    "needs": { "items": [{ "id": "1", "label": "Sustainable tech", "score": 3 }], "avg_score": 3 },
    "paid_for": { "items": [{ "id": "1", "label": "Consulting", "score": 5 }], "avg_score": 5 }
  },
  "theme": "light"
}

6. Explicitly out of scope for this build (v2 candidates)

The Past/journaling module

Inoue Social / Non-Social / Anti-Social tagging

Yoshida ikigai-scale scoring

Historical "Credits" modal (Kamiya, Zuzunaga, Winn attribution) and the legal/context disclaimer modal

Any server-side storage or accounts

Keep the initial Lovable prompt scoped to sections 2–5 above. Adding the v2 items later, once the reactive core is solid, will use fewer tokens than trying to get everything right in one large generation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9bc3ccf6-bb0d-40c2-a8b6-dcf3ea44ca96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
