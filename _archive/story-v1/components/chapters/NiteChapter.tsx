import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "../../motion/core";
import { useWorldPalette } from "../../motion/useWorldPalette";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { ChapterMeta } from "./ChapterMeta";
import { SplitLine } from "../typography/SplitLine";
import type { Project } from "../../content/types";

/**
 * Black and white, outlines and negative space. The mark's geometry becomes
 * the page grid: content sits inside the regions its lines create.
 */
export function NiteChapter({ project, index }: { project: Project; index: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorldPalette(root, project.palette);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.from(".nite-rule", {
        scrollTrigger: { trigger: root.current, start: "top 72%" },
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.1,
        ease: EASE.compose,
        stagger: 0.1,
      });

      gsap.from(".nite-col", {
        scrollTrigger: { trigger: ".nite-grid", start: "top 78%" },
        scaleY: 0,
        transformOrigin: "top center",
        duration: 1.2,
        ease: EASE.compose,
        stagger: 0.12,
      });

      gsap.from(".nite-reveal", {
        scrollTrigger: { trigger: ".nite-grid", start: "top 70%" },
        yPercent: 28,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.1,
      });

      gsap.fromTo(
        ".nite-plate",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: EASE.compose,
          scrollTrigger: { trigger: ".nite-plate", start: "top 82%" },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="chapter nite" ref={root} id={project.slug} aria-labelledby={`${project.slug}-title`}>
      <header className="chapter-head nite-head">
        <span className="chapter-num u-label">{String(index).padStart(2, "0")}</span>
        <h2 className="chapter-title u-display" id={`${project.slug}-title`}>
          {project.title}
        </h2>
        {project.oneLiner && <SplitLine className="chapter-line" text={project.oneLiner} />}
      </header>

      <span className="nite-rule" aria-hidden="true" />

      <div className="nite-grid">
        <span className="nite-col" aria-hidden="true" />
        <span className="nite-col nite-col-2" aria-hidden="true" />

        <div className="nite-region nite-region-a">
          {project.logo && (
            <img
              className="nite-plate"
              src={project.logo.url}
              alt={project.logo.alt ?? `${project.title} identity`}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>

        <div className="nite-region nite-region-b chapter-body">
          {project.summary && <p className="nite-reveal chapter-lede u-measure">{project.summary}</p>}
          {project.description && <p className="nite-reveal u-measure">{project.description}</p>}
          {project.storyContext && <p className="nite-reveal chapter-context u-measure">{project.storyContext}</p>}
          <div className="nite-reveal">
            <ChapterMeta project={project} />
          </div>
        </div>

        {project.gallery.slice(0, 2).map((media) => (
          <div className="nite-region nite-region-c" key={media.id}>
            <img className="nite-reveal" src={media.url} alt={media.alt ?? ""} loading="lazy" decoding="async" />
          </div>
        ))}
      </div>

      <span className="nite-rule" aria-hidden="true" />
    </section>
  );
}
