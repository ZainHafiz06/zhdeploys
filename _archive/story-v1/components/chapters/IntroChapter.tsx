import { useRef } from "react";
import { gsap, useGSAP, EASE, DUR } from "../../motion/core";
import { ContourField } from "../graphics/ContourField";
import { SplitLine } from "../typography/SplitLine";
import { scrollToSection } from "../../motion/lenis";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { useWorldPalette } from "../../motion/useWorldPalette";

/**
 * Entering the system: near-empty frame, one line, and the first three
 * horizontal forms drawing themselves out of the dark — Haze arriving.
 */
export function IntroChapter({ line, firstChapterSlug }: { line: string; firstChapterSlug?: string }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useWorldPalette(root, { background: "#050505", foreground: "#f2f2f0", accent: "#f2f2f0" }, {
    start: "top 80%",
    end: "bottom 60%",
  });

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>("[data-split-inner]", root.current!);

      if (reduced) {
        gsap.set(words, { yPercent: 0, opacity: 1 });
        gsap.set(".intro-band", { scaleX: 1, opacity: 0.5 });
        return;
      }

      // The line arrives on load.
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: DUR.composition,
          ease: EASE.enter,
          stagger: 0.075,
          delay: 0.35,
        },
      );

      // Scroll hands the frame over: the line leaves, the bands arrive.
      // immediateRender is off so this never overwrites the arrival above.
      const out = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 1 },
      });

      out
        .fromTo(
          words,
          { yPercent: 0, opacity: 1 },
          { yPercent: -120, opacity: 0, duration: 1, ease: EASE.exit, stagger: 0.02, immediateRender: false },
          0,
        )
        .fromTo(
          ".intro-cue",
          { opacity: 1 },
          { opacity: 0, duration: 0.3, immediateRender: false },
          0,
        )
        .fromTo(
          ".intro-band",
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 0.55, duration: 1, ease: EASE.compose, stagger: 0.14 },
          0.25,
        );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="intro" ref={root} id="intro" aria-label="Introduction">
      <div className="intro-contour" aria-hidden="true">
        <ContourField className="contour-canvas" opacity={0.055} />
      </div>

      <div className="intro-center">
        <SplitLine as="h1" className="intro-line u-display" text={line} />
      </div>

      <div className="intro-bands" aria-hidden="true">
        <span className="intro-band" />
        <span className="intro-band" />
        <span className="intro-band" />
      </div>

      <button
        type="button"
        className="intro-cue"
        onClick={() => firstChapterSlug && scrollToSection(`#${firstChapterSlug}`)}
        data-cursor="SCROLL"
      >
        <span className="u-label">Scroll</span>
        <span className="intro-cue-rule" aria-hidden="true" />
      </button>
    </section>
  );
}
