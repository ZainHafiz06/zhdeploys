import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "../motion/core";
import { scrollToSection } from "../motion/lenis";
import { buildChapters, useSiteContent } from "../content/store";
import { IntroChapter } from "../components/chapters/IntroChapter";
import { HazeChapter } from "../components/chapters/HazeChapter";
import { HazeToNite } from "../components/chapters/HazeToNite";
import { NiteChapter } from "../components/chapters/NiteChapter";
import { NiteToMun } from "../components/chapters/NiteToMun";
import { MunSequence } from "../components/chapters/MunSequence";
import { ResearchToVaqfa } from "../components/chapters/ResearchToVaqfa";
import { VaqfaChapter } from "../components/chapters/VaqfaChapter";
import { GenericChapter } from "../components/chapters/GenericChapter";
import { Finale } from "../components/chapters/Finale";
import { ChapterRail } from "../components/navigation/ChapterRail";
import { LinksPanel } from "../components/navigation/LinksPanel";
import type { Chapter } from "../content/types";
import "../styles/story.css";

/** Bespoke treatments by slug; anything else gets the generic chapter. */
const TREATMENTS = new Set(["haze", "nite", "mun", "vaqfa"]);

export default function Story() {
  const { content } = useSiteContent();
  const chapters = useMemo(() => buildChapters(content), [content]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [linksOpen, setLinksOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Deep links: #haze, #nite, #mun, #routing, #vaqfa
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [chapters.length]);

  useGSAP(
    () => {
      if (!chapters.length) return;

      ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      });

      chapters.forEach((chapter) => {
        const el = document.getElementById(chapter.slug);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (!self.isActive) return;
            setActiveId(chapter.id);
            // Replace, never push — scrolling must not fill the back button.
            const next = `#${chapter.slug}`;
            if (window.location.hash !== next) {
              window.history.replaceState(null, "", next);
            }
          },
        });
      });

      // Fonts settle cell metrics and line lengths; recalc once ready.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: root, dependencies: [chapters] },
  );

  const projectChapters = chapters.filter((c) => c.kind === "project");

  return (
    <div ref={root}>
      <a className="u-skip" href="#high-on-java">
        Skip to links
      </a>

      <ChapterRail
        chapters={chapters}
        activeId={activeId}
        progress={progress}
        onOpenIndex={() => setLinksOpen(true)}
      />
      <LinksPanel links={content.links} open={linksOpen} onClose={() => setLinksOpen(false)} />

      <main id="main">
        <IntroChapter line={content.settings.introLine} firstChapterSlug={chapters[0]?.slug} />

        {chapters.map((chapter, i) => (
          <Fragment key={chapter.id}>
            {renderChapter(chapter, i + 1, chapters)}
            {renderInterlude(chapter, chapters[i + 1], content.projects.find((p) => p.slug === "nite")?.logo?.url)}
          </Fragment>
        ))}

        <Finale endingLine={content.settings.endingLine} links={content.links} />
      </main>

      <footer className="story-footer">
        <button type="button" className="footer-top" onClick={() => scrollToSection("#intro")} data-cursor="TOP">
          Back to the top
        </button>
        <span className="u-label">
          {projectChapters.length} chapters · High on Java
        </span>
      </footer>
    </div>
  );
}

function renderChapter(chapter: Chapter, index: number, all: Chapter[]) {
  // Research is rendered inside the sequence of the project it belongs to,
  // so it never gets a standalone block here.
  if (chapter.kind === "research") return null;

  const project = chapter.project;
  const research = all.find(
    (c) => c.kind === "research" && c.research.relatedProjectId === project.id,
  );

  switch (TREATMENTS.has(project.slug) ? project.slug : "generic") {
    case "haze":
      return <HazeChapter project={project} index={index} />;
    case "nite":
      return <NiteChapter project={project} index={index} />;
    case "mun":
      return (
        <MunSequence
          project={project}
          research={research?.kind === "research" ? research.research : undefined}
          index={index}
          researchIndex={index + 1}
        />
      );
    case "vaqfa":
      return <VaqfaChapter project={project} index={index} />;
    default:
      return <GenericChapter project={project} index={index} />;
  }
}

function renderInterlude(current: Chapter, next: Chapter | undefined, niteLogo?: string) {
  if (!next) return null;
  const from = current.slug;
  const to = next.slug;
  if (from === "haze" && to === "nite") return <HazeToNite niteLogo={niteLogo} />;
  if (from === "nite" && to === "mun") return <NiteToMun />;
  if (current.kind === "research" && to === "vaqfa") return <ResearchToVaqfa />;
  return null;
}
