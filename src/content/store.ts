import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "../lib/env";
import { seedContent } from "./seed";
import type { Chapter, Project, Research, SiteContent, SiteLink, SiteSettings } from "./types";

/**
 * Content loader. Reads published rows from Supabase when configured and
 * falls back to the local seed so the experience always renders.
 */

type Row = Record<string, unknown>;

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

export function rowToProject(r: Row): Project {
  const seed = seedContent.projects.find((p) => p.id === r.id);
  return {
    id: String(r.id),
    slug: String(r.slug ?? r.id),
    title: String(r.title ?? ""),
    shortTitle: (r.short_title as string) ?? undefined,
    year: (r.year as string) ?? undefined,
    type: (r.type as string) ?? undefined,
    role: (r.role as string) ?? undefined,
    status: (r.status as string) ?? undefined,
    oneLiner: (r.one_liner as string) ?? undefined,
    summary: (r.summary as string) ?? undefined,
    description: (r.description as string) ?? undefined,
    storyContext: (r.story_context as string) ?? undefined,
    stack: arr(r.stack),
    responsibilities: arr(r.responsibilities),
    outcomes: arr(r.outcomes),
    logo: (r.logo as Project["logo"]) ?? seed?.logo,
    heroMedia: (r.hero_media as Project["heroMedia"]) ?? undefined,
    gallery: (r.gallery as Project["gallery"]) ?? [],
    video: (r.video as Project["video"]) ?? undefined,
    palette: (r.palette as Project["palette"]) ?? seed?.palette ?? {
      background: "#000000",
      foreground: "#ffffff",
      accent: "#ffffff",
    },
    externalUrl: (r.external_url as string) ?? undefined,
    githubUrl: (r.github_url as string) ?? undefined,
    caseStudyUrl: (r.case_study_url as string) ?? undefined,
    blocks: (r.blocks as Project["blocks"]) ?? [],
    order: Number(r.order_index ?? 0),
    published: Boolean(r.published),
    featured: Boolean(r.featured),
    createdAt: (r.created_at as string) ?? undefined,
    updatedAt: (r.updated_at as string) ?? undefined,
  };
}

export function projectToRow(p: Project): Row {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    short_title: p.shortTitle ?? null,
    year: p.year ?? null,
    type: p.type ?? null,
    role: p.role ?? null,
    status: p.status ?? null,
    one_liner: p.oneLiner ?? null,
    summary: p.summary ?? null,
    description: p.description ?? null,
    story_context: p.storyContext ?? null,
    stack: p.stack,
    responsibilities: p.responsibilities,
    outcomes: p.outcomes,
    logo: p.logo ?? null,
    hero_media: p.heroMedia ?? null,
    gallery: p.gallery,
    video: p.video ?? null,
    palette: p.palette,
    external_url: p.externalUrl ?? null,
    github_url: p.githubUrl ?? null,
    case_study_url: p.caseStudyUrl ?? null,
    blocks: p.blocks,
    order_index: p.order,
    published: p.published,
    featured: p.featured,
    updated_at: new Date().toISOString(),
  };
}

export function rowToResearch(r: Row): Research {
  return {
    id: String(r.id),
    slug: String(r.slug ?? r.id),
    title: String(r.title ?? ""),
    subtitle: (r.subtitle as string) ?? undefined,
    relatedProjectId: (r.related_project_id as string) ?? undefined,
    oneLiner: (r.one_liner as string) ?? undefined,
    abstract: (r.abstract as string) ?? undefined,
    motivation: (r.motivation as string) ?? undefined,
    researchQuestion: (r.research_question as string) ?? undefined,
    methodology: (r.methodology as string) ?? undefined,
    datasets: arr(r.datasets),
    models: arr(r.models),
    metrics: arr(r.metrics),
    results: arr(r.results),
    limitations: arr(r.limitations),
    figures: (r.figures as Research["figures"]) ?? [],
    paperUrl: (r.paper_url as string) ?? undefined,
    pdfUrl: (r.pdf_url as string) ?? undefined,
    githubUrl: (r.github_url as string) ?? undefined,
    status: (r.status as string) ?? undefined,
    authors: arr(r.authors),
    affiliation: (r.affiliation as string) ?? undefined,
    year: (r.year as string) ?? undefined,
    order: Number(r.order_index ?? 0),
    published: Boolean(r.published),
  };
}

export function researchToRow(x: Research): Row {
  return {
    id: x.id,
    slug: x.slug,
    title: x.title,
    subtitle: x.subtitle ?? null,
    related_project_id: x.relatedProjectId ?? null,
    one_liner: x.oneLiner ?? null,
    abstract: x.abstract ?? null,
    motivation: x.motivation ?? null,
    research_question: x.researchQuestion ?? null,
    methodology: x.methodology ?? null,
    datasets: x.datasets,
    models: x.models,
    metrics: x.metrics,
    results: x.results,
    limitations: x.limitations,
    figures: x.figures,
    paper_url: x.paperUrl ?? null,
    pdf_url: x.pdfUrl ?? null,
    github_url: x.githubUrl ?? null,
    status: x.status ?? null,
    authors: x.authors,
    affiliation: x.affiliation ?? null,
    year: x.year ?? null,
    order_index: x.order,
    published: x.published,
    updated_at: new Date().toISOString(),
  };
}

export function rowToLink(r: Row): SiteLink {
  return {
    id: String(r.id),
    label: String(r.label ?? ""),
    url: String(r.url ?? ""),
    description: (r.description as string) ?? undefined,
    icon: (r.icon as string) ?? undefined,
    order: Number(r.order_index ?? 0),
    visible: Boolean(r.visible),
    openInNewTab: r.open_in_new_tab !== false,
  };
}

export function linkToRow(l: SiteLink): Row {
  return {
    id: l.id,
    label: l.label,
    url: l.url,
    description: l.description ?? null,
    icon: l.icon ?? null,
    order_index: l.order,
    visible: l.visible,
    open_in_new_tab: l.openInNewTab,
  };
}

export function rowToSettings(r: Row): SiteSettings {
  return {
    introLine: String(r.intro_line ?? seedContent.settings.introLine),
    endingLine: String(r.ending_line ?? seedContent.settings.endingLine),
    signatureLine: (r.signature_line as string) ?? seedContent.settings.signatureLine,
    resumeUrl: (r.resume_url as string) ?? undefined,
    seoTitle: String(r.seo_title ?? seedContent.settings.seoTitle),
    seoDescription: String(r.seo_description ?? seedContent.settings.seoDescription),
    socialImage: (r.social_image as string) ?? undefined,
    transitions: (r.transitions as Record<string, string>) ?? seedContent.settings.transitions,
  };
}

export function settingsToRow(s: SiteSettings): Row {
  return {
    id: 1,
    intro_line: s.introLine,
    ending_line: s.endingLine,
    signature_line: s.signatureLine ?? null,
    resume_url: s.resumeUrl ?? null,
    seo_title: s.seoTitle,
    seo_description: s.seoDescription,
    social_image: s.socialImage ?? null,
    transitions: s.transitions,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchContent(options?: { includeDrafts?: boolean }): Promise<SiteContent> {
  if (!isSupabaseConfigured) return seedContent;
  // Loaded on demand so the client SDK stays out of the public bundle.
  const { supabase } = await import("../lib/supabase");
  if (!supabase) return seedContent;
  const drafts = options?.includeDrafts === true;
  try {
    const projectQuery = supabase.from("projects").select("*").order("order_index");
    const researchQuery = supabase.from("research").select("*").order("order_index");
    const linkQuery = supabase.from("links").select("*").order("order_index");

    const [p, r, l, s] = await Promise.all([
      drafts ? projectQuery : projectQuery.eq("published", true),
      drafts ? researchQuery : researchQuery.eq("published", true),
      drafts ? linkQuery : linkQuery.eq("visible", true),
      supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (p.error || r.error || l.error) return seedContent;

    const projects = (p.data ?? []).map(rowToProject);
    return {
      projects: projects.length ? projects : seedContent.projects,
      research: (r.data ?? []).map(rowToResearch),
      links: (l.data ?? []).map(rowToLink),
      settings: s.data ? rowToSettings(s.data as Row) : seedContent.settings,
    };
  } catch {
    return seedContent;
  }
}

export function useSiteContent(options?: { includeDrafts?: boolean }) {
  const [content, setContent] = useState<SiteContent>(seedContent);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    fetchContent(options).then((c) => {
      if (!alive) return;
      setContent(c);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.includeDrafts]);

  return { content, loading };
}

/**
 * Narrative order: projects by order_index, with each research entry inserted
 * immediately after the project it belongs to.
 */
export function buildChapters(content: SiteContent): Chapter[] {
  const chapters: Chapter[] = [];
  const projects = [...content.projects].filter((p) => p.published).sort((a, b) => a.order - b.order);
  const research = [...content.research].filter((r) => r.published).sort((a, b) => a.order - b.order);

  for (const project of projects) {
    chapters.push({ kind: "project", id: project.id, slug: project.slug, project });
    for (const r of research.filter((x) => x.relatedProjectId === project.id)) {
      chapters.push({ kind: "research", id: r.id, slug: r.slug, research: r });
    }
  }
  for (const r of research.filter((x) => !projects.some((p) => p.id === x.relatedProjectId))) {
    chapters.push({ kind: "research", id: r.id, slug: r.slug, research: r });
  }
  return chapters;
}

export function chapterTitle(c: Chapter): string {
  return c.kind === "project" ? c.project.shortTitle || c.project.title : c.research.title;
}

export function chapterLine(c: Chapter): string | undefined {
  return c.kind === "project" ? c.project.oneLiner : c.research.oneLiner;
}
