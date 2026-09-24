import { useRef } from "react";
import { gsap, useGSAP, EASE } from "../../motion/core";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { useWorldPalette } from "../../motion/useWorldPalette";

/**
 * Haze's rounded bands lose their fill, become strokes, elongate and
 * reorganise into the geometry of the Nite mark. One world becoming another.
 */
export function HazeToNite({ niteLogo }: { niteLogo?: string }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  // The bridge itself owns monochrome, so the drain is visible while pinned.
  useWorldPalette(root, { background: "#000000", foreground: "#ffffff", accent: "#ffffff" }, {
    start: "top 40%",
    end: "bottom 60%",
  });

  useGSAP(
    () => {
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=190%",
          scrub: 1,
          pin: ".interlude-stage",
          anticipatePin: 1,
        },
      });

      // 1 — the gradient drains to monochrome while the fill leaves the bands,
      //     so what remains are strokes on black.
      tl.to(".hz-wash", { opacity: 0, duration: 0.8, ease: "none" }, 0)
        .to(".band", { fillOpacity: 0, duration: 0.7, ease: EASE.compose }, 0)
        .to(".band", { strokeOpacity: 1, duration: 0.6, ease: "none" }, 0.1)

        // 2 — round ends square off.
        .to(".band", { attr: { rx: 0 }, duration: 0.5, ease: EASE.snap }, 0.7)

        // 3 — the strokes reorganise into the mark's structure.
        .to("#band-a", { attr: { x: 62, y: 24, width: 78, height: 12 }, duration: 1, ease: EASE.compose }, 1.0)
        .to("#band-b", { attr: { x: 62, y: 24, width: 12, height: 78 }, duration: 1, ease: EASE.compose }, 1.1)
        .to("#band-c", { attr: { x: 128, y: 24, width: 12, height: 78 }, duration: 1, ease: EASE.compose }, 1.2)
        .to(".nite-leg", { strokeOpacity: 1, duration: 0.5 }, 1.7)

        // 4 — the constructed geometry gives way to the real mark.
        .to(".interlude-svg", { opacity: 0, duration: 0.5, ease: "none" }, 2.3)
        .to(".interlude-asset", { opacity: 1, duration: 0.6, ease: EASE.enter }, 2.4);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="interlude" ref={root} aria-hidden="true">
      <div className="interlude-stage">
        <div className="hz-wash" />
        <svg className="interlude-svg" viewBox="0 0 200 126" role="presentation">
          <g fill="#ffffff" fillOpacity="1" stroke="#ffffff" strokeOpacity="0" strokeWidth="1.1">
            <rect id="band-a" className="band" x="34" y="30" width="108" height="17" rx="8.5" />
            <rect id="band-b" className="band" x="46" y="53" width="124" height="19" rx="9.5" />
            <rect id="band-c" className="band" x="34" y="79" width="108" height="17" rx="8.5" />
            <rect className="nite-leg" x="62" y="62" width="12" height="40" fill="none" stroke="#fff" strokeOpacity="0" />
            <rect className="nite-leg" x="95" y="62" width="12" height="40" fill="none" stroke="#fff" strokeOpacity="0" />
          </g>
        </svg>
        {niteLogo && <img className="interlude-asset" src={niteLogo} alt="" loading="lazy" decoding="async" />}
      </div>
    </section>
  );
}
