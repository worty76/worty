/**
 * Story data for the /journey page — Dat's real story.
 *
 * Every chapter is one "episode": the page scrolls through them in order,
 * the world (setting), time of day and weather blend between chapters,
 * and the main character grows up (outfit) as the story moves on.
 *
 * To edit the story you only need to touch this file:
 *  - `lines`    → what Dat says in the dialogue box (one scroll step per line).
 *                 A line can be `{ text, fx: "rewind" }` to play the VHS-rewind effect.
 *  - `era`      → small chip shown in the corner ("2020 – 2021 · late high school")
 *  - `setting`  → which hand-drawn world is shown (see JourneySetting)
 *  - `sky`      → time of day at the start → end of the chapter (see palettes.ts)
 *  - `weather`  → falling petals / rain / floating lights
 *  - `outfit`   → how the character looks in that period of life
 *  - `debt`     → the "technical debt" meter in the HUD at chapter start → end (0..1)
 */

export type JourneySetting =
  | "hometown" // Vietnamese countryside: rice terraces, bamboo, buffalo, village gate
  | "town" // small-town street: shophouses, quán net, plastic stools
  | "school" // yellow school building, red phượng trees, the flag
  | "city" // Saigon street: tube houses, signs, lanterns, power lines, motorbikes
  | "office" // modern district with the Landmark-81-style skyline
  | "coast" // seaside road, lighthouse
  | "rooftop"; // rooftop at night over the city — today

export type JourneyOutfit = "kid" | "student" | "uni" | "engineer";

export type SkyKey =
  | "predawn"
  | "dawn"
  | "morning"
  | "noon"
  | "afternoon"
  | "golden"
  | "sunset"
  | "dusk"
  | "night"
  | "storm"
  | "sunrise";

export interface JourneyWeather {
  /** 0..1 falling flower petals */
  petals?: number;
  petalColor?: string;
  /** 0..1 rain (≥ 0.6 also brings lightning) */
  rain?: number;
  /** 0..1 floating light motes / fireflies */
  motes?: number;
  moteColor?: string;
}

export type JourneyLine = string | { text: string; fx?: "rewind" };

export interface JourneyChapter {
  id: string;
  title: string;
  era: string;
  setting: JourneySetting;
  outfit: JourneyOutfit;
  sky: [from: SkyKey, to: SkyKey];
  weather?: JourneyWeather;
  /** "technical debt" meter, start → end of the chapter (0..1) */
  debt: [from: number, to: number];
  /** accent colour for the episode title + dialogue name tag */
  accent: string;
  lines: JourneyLine[];
}

export const lineText = (l: JourneyLine) => (typeof l === "string" ? l : l.text);
export const lineFx = (l: JourneyLine) => (typeof l === "string" ? undefined : l.fx);

export const JOURNEY_TITLE = "The Road So Far";
export const JOURNEY_TAGLINE = "a story about wasted time — and paying back the debt";
export const HERO_NAME = "Dat";

export const JOURNEY: JourneyChapter[] = [
  {
    id: "games",
    title: "The Kid Who Only Played Games",
    era: "childhood",
    setting: "hometown",
    outfit: "kid",
    sky: ["predawn", "morning"],
    weather: { motes: 0.35, moteColor: "#fff1c4" },
    debt: [0.05, 0.3],
    accent: "#ffb36b",
    lines: [
      "When I was little, I never really studied. Bad grades, year after year.",
      "What I truly dove deep into was games. Not lessons, not homework — just games, for hours and hours.",
      "I didn't know it yet, but every hour I let slip away was a debt. And debts always come back to be paid.",
    ],
  },
  {
    id: "words",
    title: "Words That Stuck",
    era: "growing up",
    setting: "town",
    outfit: "student",
    sky: ["golden", "dusk"],
    weather: { motes: 0.2, moteColor: "#ffd9a0" },
    debt: [0.3, 0.55],
    accent: "#ff8a5c",
    lines: [
      "Eventually, my parents stopped believing in me. \"Maybe you should just go to a sports college,\" they said.",
      "And the worst part? I believed them too. I was angry — mostly at myself.",
      { text: "It cost me a lot. I wish I could rewind time and do it all over again…", fx: "rewind" },
      "…but this isn't an anime. It's real life. There's no rewind button.",
    ],
  },
  {
    id: "comeback",
    title: "Paying Back the Debt",
    era: "the comeback",
    setting: "school",
    outfit: "student",
    sky: ["morning", "noon"],
    weather: { petals: 0.45, petalColor: "#ff4a2e" },
    debt: [0.55, 0.4],
    accent: "#5fd3c6",
    lines: [
      "So I made a decision: learn from now on. Play less. Start paying back my \"technical debt\".",
      "I wanted to become the version of me that little me wished he could be.",
      "My first comeback was English — finally, something I was good at. The one thing about studying I could feel confident in.",
      "Focusing was always hard for me. Maybe it's ADHD. Or maybe… I was just scared of failing again.",
    ],
  },
  {
    id: "path",
    title: "Choosing a Path",
    era: "2020 – 2021 · late high school",
    setting: "school",
    outfit: "student",
    sky: ["afternoon", "golden"],
    weather: { petals: 0.9, petalColor: "#ff4a2e" },
    debt: [0.4, 0.28],
    accent: "#ff5a3c",
    lines: [
      "Late in high school, I had to choose a major. I picked IT — the same path my older brother chose.",
      "No big plan. I was just good with computers: gaming, typing fast, Windows, Linux, figuring out how machines work.",
      "And I guess I chose right. I fell in love with it.",
    ],
  },
  {
    id: "online",
    title: "Online, Together",
    era: "2021 – 2022 · college, COVID-19",
    setting: "city",
    outfit: "uni",
    sky: ["dusk", "night"],
    weather: { motes: 0.45, moteColor: "#ffd27a" },
    debt: [0.28, 0.32],
    accent: "#ff7ac8",
    lines: [
      "College started in the middle of COVID-19. Most classes were online — just screens, cameras off, muted mics.",
      "But I found a group of new friends who loved computers as much as I did. We talked about everything, for hours.",
    ],
  },
  {
    id: "stacked",
    title: "Debt on Top of Debt",
    era: "college years",
    setting: "city",
    outfit: "uni",
    sky: ["storm", "storm"],
    weather: { rain: 1 },
    debt: [0.32, 0.96],
    accent: "#8fb4ff",
    lines: [
      "Then came the average college years. Studying a bit, playing a lot, no plans at all.",
      "No part-time job, no side projects, no idea what I wanted. The same old me — careless about time, careless about my future.",
      "And guess what? The technical debt stacked on top of the technical debt. I didn't even know what I was living for.",
    ],
  },
  {
    id: "late",
    title: "Coming Clean",
    era: "graduation",
    setting: "hometown",
    outfit: "uni",
    sky: ["storm", "sunrise"],
    weather: { rain: 0.35 },
    debt: [0.96, 0.8],
    accent: "#ffd27a",
    lines: [
      "Then everything came due, all at once. I graduated late.",
      "I didn't dare to tell my family. For a long time, I just… couldn't.",
      "But I said it. That was the moment I stopped running from the debt and started facing it.",
    ],
  },
  {
    id: "job",
    title: "The Job I Love",
    era: "2025 → now",
    setting: "office",
    outfit: "engineer",
    sky: ["sunrise", "morning"],
    weather: { motes: 0.4, moteColor: "#fff4cf" },
    debt: [0.8, 0.35],
    accent: "#5fd3c6",
    lines: [
      "And then — I got a job I truly love.",
      "Microservices, Go, cloud on AWS… real systems, real production, real problems to solve.",
      "And the people. So many lovely people. I've learned more here than in all the years before.",
    ],
  },
  {
    id: "now",
    title: "Still Paying, Still Building",
    era: "today · one year in",
    setting: "rooftop",
    outfit: "engineer",
    sky: ["dusk", "night"],
    weather: { motes: 0.55, moteColor: "#d9ff8a" },
    debt: [0.35, 0.22],
    accent: "#b69cff",
    lines: [
      "It's been a year now. The debt isn't fully paid — but every single day, I pay back a little more.",
      "If there's one thing I've learned: wasted time always costs. And you're the one who pays — or the people you love.",
      "I'm becoming the person little me wished to be. The story isn't finished — see you in the next episode.",
    ],
  },
];

export const CREDITS: { role: string; name: string }[] = [
  { role: "Story", name: "Le Thanh Dat" },
  { role: "Main character", name: "Dat — the kid who finally pressed start" },
  { role: "Powered by", name: "Go · microservices · AWS · cà phê sữa đá" },
  { role: "Soundtrack", name: "motorbikes, cicadas, rain & keyboard clicks" },
  { role: "Special thanks", name: "my parents, my brother, my friends & teammates" },
  { role: "And", name: "you — for scrolling this far" },
];
