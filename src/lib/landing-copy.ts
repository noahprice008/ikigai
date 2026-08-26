import type { DimensionKey, ZoneKey } from "./ikigai";

export const PILLARS: {
  key: DimensionKey;
  title: string;
  definition: string;
  benefit: string;
  prompts: string[];
  swatchClass: string;
}[] = [
  {
    key: "love",
    title: "What you love",
    definition: "Activities, passions and interests that energise your spirit.",
    benefit:
      "Identifies your internal spark, so long-term energy is sustained and burnout stays away.",
    prompts: [
      "What activities make you lose track of time?",
      "What topics do you read about for fun?",
      "What would you do even if you weren't paid?",
    ],
    swatchClass: "bg-love",
  },
  {
    key: "good_at",
    title: "What you're good at",
    definition: "Your natural talents, developed competencies and craft.",
    benefit: "Highlights where your instinct lives, building a sense of mastery and flow.",
    prompts: [
      "Where does your craft and instinct already live?",
      "What do friends or colleagues ask you for help with?",
      "What competencies have you spent years developing?",
    ],
    swatchClass: "bg-good-at",
  },
  {
    key: "needs",
    title: "What the world needs",
    definition: "Problems you care about and needs you can fulfil for others.",
    benefit: "Connects your life to a larger social effect, preventing isolation and building utility.",
    prompts: [
      "What gaps do you notice in your community or the world?",
      "What problems make you feel a sense of responsibility to solve?",
      "Where can you bring the most utility to others?",
    ],
    swatchClass: "bg-needs",
  },
  {
    key: "paid_for",
    title: "What you can be paid for",
    definition: "Marketable skills and monetisable expertise.",
    benefit: "Ensures your path is sustainable and viable within the modern economy.",
    prompts: [
      "What marketable skills do you currently possess?",
      "Where does your work meet a current market demand?",
      "What services do others value enough to compensate you for?",
    ],
    swatchClass: "bg-paid-for",
  },
];

export const ZONE_INSIGHTS: Record<ZoneKey, { formula: string; feeling: string }> = {
  passion: {
    formula: "Love + Skill",
    feeling:
      "You feel energised and skilled, but the path is often not sustainable or lacks financial stability.",
  },
  profession: {
    formula: "Skill + Payment",
    feeling: "You are competent and compensated, but your daily life feels hollow or lacks meaning.",
  },
  vocation: {
    formula: "Payment + Need",
    feeling:
      "You are helping and earning, but the work is not fulfilling because it does not align with your heart.",
  },
  mission: {
    formula: "Need + Love",
    feeling:
      "You feel deep purpose and connection, but the activity is not viable without monetisable expertise.",
  },
};

export const VALUE_PROPS: { title: string; body: string }[] = [
  {
    title: "Purpose-driven longevity",
    body: "People with a clear sense of Ikigai show a 1.55× lower risk of functional decline than those who work only for financial reasons.",
  },
  {
    title: "Emotional wellness",
    body: "Naming your Ikigai protects against anxiety and low mood — the eudaimonic well-being of a life lived on purpose.",
  },
  {
    title: "Against isolation",
    body: "\"People who isolate themselves can't have ikigai.\" The map helps you find your Moai — the relationships that hold you.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "What is the difference between passion and Ikigai?",
    a: "Finding your passion looks only at what you love. Ikigai is holistic: it asks for the intersection of what you love, what you're good at, what the world needs and what you can be paid for. Holistic balance beats passion-only focus because it makes your purpose sustainable and practical in the real world.",
  },
  {
    q: "How often should I reflect on my map?",
    a: "Ikigai is an evolving live map, not a one-time exercise. We recommend quarterly check-ins. As you gain new skills and insights your map will shift, and regular reflection helps you notice patterns and align your life with your growth.",
  },
  {
    q: "Can I use this map for career planning?",
    a: "Absolutely. Assess job offers, plan pivots, or decide which skills to develop next by filtering the decision through your Ikigai alignment — does this opportunity bring you closer to the centre of your map?",
  },
  {
    q: "What should I do after I finish my mapping?",
    a: "Identify activities that appear in multiple categories; these sit closest to your Ikigai. Then start low-risk experiments — a side project, a new hobby — to test how those intersections perform in reality before making major life changes.",
  },
];

export const OGIMI_HABITS: { title: string; body: string }[] = [
  {
    title: "Stay active; don't retire",
    body: "Keep bringing utility to others. Even after an official career ends, continue doing things of value.",
  },
  {
    title: "Take it slow",
    body: "Leave urgency behind. Practise mindfulness so you control your time rather than living under stress.",
  },
  {
    title: "Hara hachi bu — eat to 80%",
    body: "Put your fork down at 80% full and let your brain's satiety signals catch up.",
  },
  {
    title: "Moai — nurture friendships",
    body: "Instead of scrolling a feed, call a friend: share stories and confide worries to avoid isolation.",
  },
  {
    title: "Get in shape",
    body: "Your body needs daily maintenance. Move every day to release the hormones that make you feel happy.",
  },
  {
    title: "Smile",
    body: "A cheerful attitude recognises the privilege of being in the here and now.",
  },
  {
    title: "Shinrin-yoku — reconnect with nature",
    body: "Practise forest bathing. Use all five senses to recharge in the natural world.",
  },
  {
    title: "Give thanks",
    body: "Spend a moment daily thanking your ancestors, nature and community to grow your stockpile of happiness.",
  },
  {
    title: "Live in the moment",
    body: "Stop regretting the past or fearing the future. Today is all you have — make it worth remembering.",
  },
  {
    title: "Follow your Ikigai",
    body: "Trust the spectrum of small things that drive you to share the best of yourself with the world.",
  },
];
