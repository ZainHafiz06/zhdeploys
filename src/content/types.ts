/** Content schema shared by the public experience and the /studio admin. */

export type MediaKind = "image" | "video" | "svg" | "pdf";

export interface MediaAsset {
  id: string;
  url: string;
  kind: MediaKind;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export type BlockKind =
  | "text"
  | "image"
  | "video"
  | "quote"
  | "metric"
  | "code"
  | "gallery"
  | "comparison"
  | "embed";

export interface ContentBlock {
  id: string;
  kind: BlockKind;
  /** Prose for text/quote, caption for media, language label for code. */
  title?: string;
  body?: string;
  media?: MediaAsset[];
  /** metric blocks only — never invent these, they come from the admin. */
  value?: string;
  label?: string;
}

export interface Palette {
  background: string;
  foreground: string;
  accent: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  year?: string;
  type?: string;
  role?: string;
  status?: string;
  /** The single narrative line that carries this chapter. */
  oneLiner?: string;
  summary?: string;
  description?: string;
  /** Why this chapter matters in the sequence. */
  storyContext?: string;
  stack: string[];
  responsibilities: string[];
  outcomes: string[];
  logo?: MediaAsset;
  heroMedia?: MediaAsset;
  gallery: MediaAsset[];
  video?: MediaAsset;
  palette: Palette;
  externalUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  blocks: ContentBlock[];
  order: number;
  published: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Research {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  relatedProjectId?: string;
  oneLiner?: string;
  abstract?: string;
  motivation?: string;
  researchQuestion?: string;
  methodology?: string;
  datasets: string[];
  models: string[];
  metrics: string[];
  results: string[];
  limitations: string[];
  figures: MediaAsset[];
  paperUrl?: string;
  pdfUrl?: string;
  githubUrl?: string;
  status?: string;
  authors: string[];
  affiliation?: string;
  year?: string;
  order: number;
  published: boolean;
}

export interface SiteLink {
  id: string;
  label: string;
  url: string;
  description?: string;
  icon?: string;
  order: number;
  visible: boolean;
  openInNewTab: boolean;
}

export interface SiteSettings {
  introLine: string;
  endingLine: string;
  signatureLine?: string;
  resumeUrl?: string;
  seoTitle: string;
  seoDescription: string;
  socialImage?: string;
  /** Per-chapter transition copy, keyed by project slug or "intro"/"finale". */
  transitions: Record<string, string>;
}

export interface SiteContent {
  projects: Project[];
  research: Research[];
  links: SiteLink[];
  settings: SiteSettings;
}

/** A chapter is a project or a research entry, resolved in narrative order. */
export type Chapter =
  | { kind: "project"; id: string; slug: string; project: Project }
  | { kind: "research"; id: string; slug: string; research: Research };
