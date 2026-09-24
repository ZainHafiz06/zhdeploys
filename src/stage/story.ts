/**
 * The whole home page is one timeline measured in "beats": one beat is one
 * viewport height of scroll. Every range below is [start, end] in beats, and
 * the timeline, the blurbs and the index all read from here.
 */

export type AppId = "haze" | "mun" | "vaqfa" | "nite";

export interface Blurb {
  id: string;
  app: AppId;
  /** Beats during which the blurb is fully readable (it fades around them). */
  at: [number, number];
  title: string;
  body: string;
}

export interface Chapter {
  app: AppId;
  label: string;
  logo: string;
  /** First beat at which this app owns the screen. */
  start: number;
  end: number;
}

export const INTRO_END = 1.3;

export const CHAPTERS: Chapter[] = [
  { app: "haze", label: "haze", logo: "/projects/haze/haze-logo.jpg", start: 1.0, end: 6.2 },
  { app: "mun", label: "mūn", logo: "/projects/mun/mun-logo.png", start: 6.2, end: 10.4 },
  { app: "vaqfa", label: "vaqfa", logo: "/projects/vaqfa/vaqfa-logo.png", start: 10.4, end: 14.2 },
  { app: "nite", label: "nite", logo: "/projects/nite/nite-logo.jpg", start: 14.2, end: 21.0 },
];

/** Laptop leaves, phone arrives. */
export const SWAP: [number, number] = [14.2, 15.0];
export const OUTRO: [number, number] = [21.0, 22.0];
export const END = 22.6;

export const BLURBS: Blurb[] = [
  {
    id: "haze-1",
    app: "haze",
    at: [1.35, 2.2],
    title: "It all starts here.",
    body: "hazeCSS is a component-first CSS framework: polished, responsive interface pieces, one class away.",
  },
  {
    id: "haze-2",
    app: "haze",
    at: [2.55, 3.4],
    title: "Find it.",
    body: "Every component is numbered. haze-nav-1, haze-nav-2 — the name is the API.",
  },
  {
    id: "haze-3",
    app: "haze",
    at: [3.75, 4.75],
    title: "Tune it.",
    body: "Change accent, radius and spacing through CSS variables and watch the preview follow.",
  },
  {
    id: "haze-4",
    app: "haze",
    at: [5.05, 5.9],
    title: "Swap it.",
    body: "In the playground, haze-card-2 becomes haze-card-4 and the whole design changes with it.",
  },
  {
    id: "mun-1",
    app: "mun",
    at: [6.45, 7.05],
    title: "One question, many minds.",
    body: "MŪN sends every prompt to a council of language models at once.",
  },
  {
    id: "mun-2",
    app: "mun",
    at: [7.35, 8.45],
    title: "Assemble your council.",
    body: "Browse every public model by the lab behind it, and switch on the ones you trust.",
  },
  {
    id: "mun-3",
    app: "mun",
    at: [8.8, 10.05],
    title: "Consensus, not a guess.",
    body: "A judge reads every answer, settles the disagreements and tells you how confident it is.",
  },
  {
    id: "vaqfa-1",
    app: "vaqfa",
    at: [10.65, 11.35],
    title: "Your Drive is the CMS.",
    body: "Vaqfa turns a Google Drive folder into a photography portfolio that stays in sync.",
  },
  {
    id: "vaqfa-2",
    app: "vaqfa",
    at: [11.65, 12.55],
    title: "The work comes first.",
    body: "A masonry archive with photo and video filters, and a quiet full-screen viewer.",
  },
  {
    id: "vaqfa-3",
    app: "vaqfa",
    at: [12.9, 13.85],
    title: "Yours, by name.",
    body: "Every photographer gets their own address, a template, and an Info page for the story behind the work.",
  },
  {
    id: "nite-1",
    app: "nite",
    at: [15.2, 15.8],
    title: "enjoy smarter.",
    body: "nite is one app for college life: what's happening around you, and what you need to get done.",
  },
  {
    id: "nite-2",
    app: "nite",
    at: [16.1, 17.2],
    title: "Students only.",
    body: "A school email and a six-digit code keep nite's rides, stays and messages among verified students.",
  },
  {
    id: "nite-3",
    app: "nite",
    at: [17.5, 18.2],
    title: "LiveLines.",
    body: "Real-time lines, covers and crowds, reported by the students who are already there.",
  },
  {
    id: "nite-4",
    app: "nite",
    at: [18.5, 19.2],
    title: "SafeRoute.",
    body: "Pick a route, share the trip, and get home safe without leaving the app.",
  },
  {
    id: "nite-5",
    app: "nite",
    at: [19.5, 20.7],
    title: "Find, then Plan.",
    body: "One toggle turns nite from what's happening tonight into what's due this week.",
  },
];

export const blurbsFor = (app: AppId) => BLURBS.filter((b) => b.app === app);
