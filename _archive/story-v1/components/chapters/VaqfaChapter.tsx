import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "../../motion/core";
import { useWorldPalette } from "../../motion/useWorldPalette";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { ChapterMeta } from "./ChapterMeta";
import { SplitLine } from "../typography/SplitLine";
import type { Project } from "../../content/types";

/**
 * Warm white, gold and black type. The mark is revealed the way a stroke is
 * written — along its own direction — rather than faded in.
 */
export function VaqfaChapter({ project, index }: { project: Project; index: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorldPalette(root, project.palette);

  useGSAP(
    () => {
      if (reduced) return;

      // Clip the wrapper, not the image: a clip on the image would create a
      // stacking context and cancel its multiply blend against the page.
      gsap.fromTo(
        ".vaqfa-plate-wrap",
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: EASE.compose,
          scrollTrigger: { trigger: ".vaqfa-plate-wrap", start: "top 80%", end: "top 30%", scrub: 1 },
        },
      );

      gsap.from(".vaqfa-reveal", {
        scrollTrigger: { trigger: ".vaqfa-body", start: "top 76%" },
        yPercent: 26,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.1,
      });

      gsap.fromTo(
        ".vaqfa-sheen",
        { xPercent: -120 },
        {
          xPercent: 140,
          ease: "none",
          scrollTrigger: { trigger: ".vaqfa-plate-wrap", start: "top 70%", end: "bottom 30%", scrub: 1.2 },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="chapter vaqfa" ref={root} id={project.slug} aria-labelledby={`${project.slug}-title`}>
      <header className="chapter-head vaqfa-head">
        <span className="chapter-num u-label">{String(index).padStart(2, "0")}</span>
        <h2 className="chapter-title u-display" id={`${project.slug}-title`}>
          {project.title}
        </h2>
        {project.oneLiner && <SplitLine className="chapter-line" text={project.oneLiner} />}
      </header>

      <figure className="vaqfa-plate-wrap">
        {project.logo && (
          <img
            className="vaqfa-plate"
            src={project.logo.url}
            alt={project.logo.alt ?? `${project.title} identity`}
            loading="lazy"
            decoding="async"
          />
        )}
        <span className="vaqfa-sheen" aria-hidden="true" />
      </figure>

      <div className="vaqfa-body chapter-body">
        {project.summary && <p className="vaqfa-reveal chapter-lede u-measure">{project.summary}</p>}
        {project.description && <p className="vaqfa-reveal u-measure">{project.description}</p>}
        {project.storyContext && <p className="vaqfa-reveal chapter-context u-measure">{project.storyContext}</p>}
        <div className="vaqfa-reveal">
          <ChapterMeta project={project} />
        </div>
      </div>
    </section>
  );
}
