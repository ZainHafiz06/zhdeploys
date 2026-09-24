import type { Project, Research, SiteContent, SiteLink, SiteSettings } from "./types";

/**
 * Seed content. Narrative copy and palettes are authored here; factual fields
 * (role, dates, descriptions, outcomes, research results) are intentionally
 * left empty so nothing is invented — fill them from /studio.
 */

const empty = { stack: [], responsibilities: [], outcomes: [], gallery: [], blocks: [] };

export const seedProjects: Project[] = [
  {
    ...empty,
    id: "haze",
    slug: "haze",
    title: "Haze",
    shortTitle: "Haze",
    oneLiner: "It started with the interface.",
    storyContext: "The first chapter, where the work was still about surface, rhythm and legibility.",
    logo: { id: "haze-logo", url: "/projects/haze/haze-logo.jpg", kind: "image", alt: "Haze logo: three soft horizontal forms" },
    palette: { background: "#c9cdf0", foreground: "#14131c", accent: "#8fb7ff" },
    order: 1,
    published: true,
    featured: false,
  },
  {
    ...empty,
    id: "nite",
    slug: "nite",
    title: "Nite",
    shortTitle: "Nite",
    oneLiner: "Then the interface became an experience.",
    storyContext: "Softness turned architectural. Geometry started carrying the structure.",
    logo: { id: "nite-logo", url: "/projects/nite/nite-logo.jpg", kind: "image", alt: "Nite logo: outlined geometric mark" },
    palette: { background: "#000000", foreground: "#ffffff", accent: "#ffffff" },
    order: 2,
    published: true,
    featured: false,
  },
  {
    ...empty,
    id: "mun",
    slug: "mun",
    title: "MŪN",
    shortTitle: "MŪN",
    oneLiner: "Then the interface started thinking back.",
    storyContext: "The turning point: a product that had to make decisions, not just present them.",
    logo: { id: "mun-logo", url: "/projects/mun/mun-logo.png", kind: "image", alt: "MŪN logo: spherical field of white points" },
    palette: { background: "#000000", foreground: "#ffffff", accent: "#8fb8ff" },
    order: 3,
    published: true,
    featured: true,
  },
  {
    ...empty,
    id: "vaqfa",
    slug: "vaqfa",
    title: "Vaqfa",
    shortTitle: "Vaqfa",
    oneLiner: "Then the work became personal.",
    storyContext: "A return to craft, language and warmth after the technical chapters.",
    logo: { id: "vaqfa-logo", url: "/projects/vaqfa/vaqfa-logo.png", kind: "image", alt: "Vaqfa logo: gold Arabic calligraphic mark" },
    palette: { background: "#f6f2ea", foreground: "#111010", accent: "#c8912f" },
    order: 4,
    published: true,
    featured: false,
  },
];

export const seedResearch: Research[] = [
  {
    id: "routing",
    slug: "routing",
    // A plain description of the subject, not a project name. Rename it from
    // /studio once the work has one.
    title: "Multi-Model Routing",
    subtitle: "Model selection across large language models",
    relatedProjectId: "mun",
    oneLiner: "The product became a question worth measuring.",
    researchQuestion:
      "How should a request be routed across multiple language models, given accuracy, cost, latency, model agreement and reliability?",
    // Deliberately empty until filled from /studio — no invented findings.
    datasets: [],
    models: [],
    metrics: ["Accuracy", "Cost", "Latency", "Model agreement", "Reliability"],
    results: [],
    limitations: [],
    figures: [],
    authors: [],
    order: 1,
    published: true,
  },
];

export const seedLinks: SiteLink[] = [
  { id: "github", label: "GitHub", url: "https://github.com/ZainHafiz06", order: 1, visible: true, openInNewTab: true },
  { id: "email", label: "Email", url: "mailto:knight200699@gmail.com", order: 2, visible: true, openInNewTab: false },
  { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/zain-h-747124296/", order: 3, visible: true, openInNewTab: true },
  { id: "x", label: "X", url: "https://x.com/zainhafiz_", order: 4, visible: true, openInNewTab: true },
];

export const seedSettings: SiteSettings = {
  introLine: "I make ideas move.",
  endingLine: "Different projects. Same habit.",
  signatureLine: "High on Java",
  seoTitle: "Zain Hafiz | High on Java",
  seoDescription:
    "An interactive portfolio: Haze, MŪN, routing research, Vaqfa and Nite, played out on screen as you scroll.",
  transitions: {
    haze: "It started with the interface.",
    nite: "Then the interface became an experience.",
    mun: "Then the interface started thinking back.",
    routing: "The product became a question worth measuring.",
    vaqfa: "Then the work became personal.",
    finale: "Different projects. Same habit.",
  },
};

export const seedContent: SiteContent = {
  projects: seedProjects,
  research: seedResearch,
  links: seedLinks,
  settings: seedSettings,
};
