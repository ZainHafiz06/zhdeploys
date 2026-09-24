import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "../../motion/core";
import { useWorldPalette } from "../../motion/useWorldPalette";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { ChapterMeta } from "./ChapterMeta";
import { SplitLine } from "../typography/SplitLine";
import type { Project } from "../../content/types";

/**
 * Long horizontal motion, soft interpolating light, ghost trails of the mark.
 * Information arrives progressively rather than all at once.
 */
export function HazeChapter({ project, index }: { project: Project; index: number }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorldPalette(root, project.palette);

  useGSAP(
    () => {
      if (reduced) return;

      gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1.1 },
      })
        .fromTo(".haze-glow", { xPercent: -14 }, { xPercent: 12, ease: "none" }, 0)
        .fromTo(".haze-plate", { xPercent: 4, scale: 1.12 }, { xPercent: -4, scale: 1.02, ease: "none" }, 0)
        .fromTo(".haze-trail", { xPercent: -60, opacity: 0 }, { xPercent: 60, opacity: 0.45, ease: "none" }, 0);

      gsap.from(".haze-reveal", {
        scrollTrigger: { trigger: ".haze-body", start: "top 78%" },
        yPercent: 40,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.12,
      });

      gsap.fromTo(
        ".haze-world",
        { clipPath: "inset(0% 0% 92% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: EASE.compose,
          scrollTrigger: { trigger: ".haze-world", start: "top 92%", end: "top 45%", scrub: 1 },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="chapter haze" ref={root} id={project.slug} aria-labelledby={`${project.slug}-title`}>
      {/* The mark's own gradient is the environment, not a plate on a page. */}
      <div className="haze-content">
        <header className="chapter-head">
          <span className="chapter-num u-label">{String(index).padStart(2, "0")}</span>
          <h2 className="chapter-title u-display" id={`${project.slug}-title`}>
            {project.title}
          </h2>
          {project.oneLiner && <SplitLine className="chapter-line" text={project.oneLiner} />}
        </header>

        {/* The mark, cropped to a band: its own gradient carries the chapter. */}
        <figure className="haze-world">
          {project.logo && (
            <img
              className="haze-plate"
              src={project.logo.url}
              alt={project.logo.alt ?? `${project.title} identity`}
              loading="lazy"
              decoding="async"
            />
          )}
          <span className="haze-trail" aria-hidden="true" />
        </figure>

        <div className="haze-body chapter-body">
          {project.summary && <p className="haze-reveal chapter-lede u-measure">{project.summary}</p>}
          {project.description && <p className="haze-reveal u-measure">{project.description}</p>}
          {project.storyContext && (
            <p className="haze-reveal chapter-context u-measure">{project.storyContext}</p>
          )}
          <div className="haze-reveal">
            <ChapterMeta project={project} />
          </div>
        </div>
      </div>

    </section>
  );
}
