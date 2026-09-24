/**
 * The whole home page is one timeline measured in "beats": one beat is one
 * viewport height of scroll. Every range below is [start, end] in beats, and
 * the timeline, the blurbs and the index all read from here.
 *
 * Sections were authored at fixed beats and later chapters were inserted, so
 * two shifts carry the original numbers to their final place:
 *   MUN_SHIFT   extra beats inside MŪN for scrolling the whole catalog
 *   LATE_SHIFT  everything originally authored from beat 10.4 on
 *               (Vaqfa, the device swap, Nite, the outro)
 */

import { tourSchedule } from "../research/tour";

export type AppId = "haze" | "mun" | "research" | "vaqfa" | "nite";

export interface Blurb {
  id: string;
  app: AppId;
  /** Beats during which the blurb is fully readable (it fades around them). */
  at: [number, number];
  title: string;
  body: string;
  /** Optional link under the body. */
  link?: { href: string; label: string };
}

export interface Chapter {
  app: AppId;
  label: string;
  logo: string;
  /** Where the header above the blurbs links to. `placeholder` means there's no live site yet. */
  href: string;
  placeholder?: boolean;
  /** First beat at which this app owns the screen. */
  start: number;
  end: number;
}

export const INTRO_END = 1.3;

export const MUN_SHIFT = 1.0;
/** The paper appears on the laptop first, then takes the frame for the tour. */
export const RESEARCH_START = 10.4 + MUN_SHIFT;
export const TOUR = tourSchedule(RESEARCH_START + 0.6);
export const RESEARCH_END = Math.ceil((TOUR.end + 0.05) * 10) / 10;
export const LATE_SHIFT = RESEARCH_END - 10.4;

const late = (t: number) => Math.round((t + LATE_SHIFT) * 1000) / 1000;

export const CHAPTERS: Chapter[] = [
  // PLACEHOLDER links: replace "#" with the live URLs when the apps are deployed.
  { app: "haze", label: "haze", logo: "/projects/haze/haze-logo.jpg", href: "#", placeholder: true, start: 1.0, end: 6.2 },
  { app: "mun", label: "mūn", logo: "/projects/mun/mun-logo.png", href: "#", placeholder: true, start: 6.2, end: RESEARCH_START },
  { app: "research", label: "research", logo: "/projects/research/research-logo.svg", href: "/research/beyond-best-single", start: RESEARCH_START, end: RESEARCH_END },
  { app: "vaqfa", label: "vaqfa", logo: "/projects/vaqfa/vaqfa-logo.png", href: "#", placeholder: true, start: RESEARCH_END, end: late(14.2) },
  { app: "nite", label: "nite", logo: "/projects/nite/nite-logo.jpg", href: "#", placeholder: true, start: late(14.2), end: late(21.0) },
];

/** Laptop leaves, phone arrives. */
export const SWAP: [number, number] = [late(14.2), late(15.0)];
export const OUTRO: [number, number] = [late(21.0), late(22.0)];
export const END = late(22.6);

const PDF_LINK = { href: "/research/beyond-best-single.pdf", label: "Read the paper (PDF) →" };

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
    body: "Every component is numbered. haze-nav-1, haze-nav-2: the name is the API.",
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
    at: [7.35, 8.45 + MUN_SHIFT],
    title: "Assemble your council.",
    body: "Every public model, 458 of them from 63 labs, organized by the lab behind it. Switch on the ones you trust.",
  },
  {
    id: "mun-3",
    app: "mun",
    at: [8.8 + MUN_SHIFT, 10.05 + MUN_SHIFT],
    title: "Consensus, not a guess.",
    body: "A judge reads every answer, settles the disagreements and tells you how confident it is.",
  },
  {
    id: "research-0",
    app: "research",
    at: [RESEARCH_START + 0.2, TOUR.zoomAt],
    title: "Then it became a question.",
    body: "Beyond Best-Single is my paper on routing each query to a cheaper model only when accuracy can afford it. Submitted to IEEE BigData 2026.",
    link: PDF_LINK,
  },
  ...TOUR.steps.map(
    (s): Blurb => ({
      id: s.id,
      app: "research",
      at: [s.holdAt - 0.05, s.holdEnd],
      title: s.title,
      body: s.body,
      link: PDF_LINK,
    }),
  ),
  {
    id: "vaqfa-1",
    app: "vaqfa",
    at: [late(10.65), late(11.35)],
    title: "Your Drive is the CMS.",
    body: "Vaqfa turns a Google Drive folder into a photography portfolio that stays in sync.",
  },
  {
    id: "vaqfa-2",
    app: "vaqfa",
    at: [late(11.65), late(12.55)],
    title: "The work comes first.",
    body: "A masonry archive with photo and video filters, and a quiet full-screen viewer.",
  },
  {
    id: "vaqfa-3",
    app: "vaqfa",
    at: [late(12.9), late(13.85)],
    title: "Yours, by name.",
    body: "Every photographer gets their own address, a template, and an Info page for the story behind the work.",
  },
  {
    id: "nite-1",
    app: "nite",
    at: [late(15.2), late(15.8)],
    title: "enjoy smarter.",
    body: "nite is one app for college life: what's happening around you, and what you need to get done.",
  },
  {
    id: "nite-2",
    app: "nite",
    at: [late(16.1), late(17.2)],
    title: "Students only.",
    body: "A school email and a six-digit code keep nite's rides, stays and messages among verified students.",
  },
  {
    id: "nite-3",
    app: "nite",
    at: [late(17.5), late(18.2)],
    title: "LiveLines.",
    body: "Real-time lines, covers and crowds, reported by the students who are already there.",
  },
  {
    id: "nite-4",
    app: "nite",
    at: [late(18.5), late(19.2)],
    title: "SafeRoute.",
    body: "Pick a route, share the trip, and get home safe without leaving the app.",
  },
  {
    id: "nite-5",
    app: "nite",
    at: [late(19.5), late(20.7)],
    title: "Find, then Plan.",
    body: "One toggle turns nite from what's happening tonight into what's due this week.",
  },
];

export const blurbsFor = (app: AppId) => BLURBS.filter((b) => b.app === app);
