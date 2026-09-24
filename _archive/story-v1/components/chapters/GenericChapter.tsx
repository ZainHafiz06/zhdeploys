import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "../../motion/core";
import { useWorldPalette } from "../../motion/useWorldPalette";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { ChapterMeta } from "./ChapterMeta";
import { SplitLine } from "../typography/SplitLine";
import type { Project } from "../../content/types";

/**
 * Fallback treatment for projects added later from /studio: it inherits the
 * project's own palette so a new chapter still changes the world around it.
 */
export function GenericChapter({ project, index }: { project: Project; index: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorldPalette(root, project.palette);

  useGSAP(
    () => {
      if (reduced) return;
      gsap.from(".generic-reveal", {
        scrollTrigger: { trigger: root.current, start: "top 74%" },
        yPercent: 30,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.1,
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="chapter generic" ref={root} id={project.slug} aria-labelledby={`${project.slug}-title`}>
      <header className="chapter-head">
        <span className="chapter-num u-label">{String(index).padStart(2, "0")}</span>
        <h2 className="chapter-title u-display" id={`${project.slug}-title`}>
          {project.title}
        </h2>
        {project.oneLiner && <SplitLine className="chapter-line" text={project.oneLiner} />}
      </header>

      <div className="chapter-body">
        {project.logo && (
          <img
            className="generic-reveal generic-plate"
            src={project.logo.url}
            alt={project.logo.alt ?? `${project.title} identity`}
            loading="lazy"
            decoding="async"
          />
        )}
        {project.summary && <p className="generic-reveal chapter-lede u-measure">{project.summary}</p>}
        {project.description && <p className="generic-reveal u-measure">{project.description}</p>}
        {project.storyContext && <p className="generic-reveal chapter-context u-measure">{project.storyContext}</p>}
        <div className="generic-reveal">
          <ChapterMeta project={project} />
        </div>
      </div>
    </section>
  );
}
