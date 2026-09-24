import { useRef } from "react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { useGSAP, EASE } from "../../motion/core";
import { useReducedMotion } from "../../motion/useReducedMotion";

gsap.registerPlugin(MorphSVGPlugin);

/** Where each measurement trace ends up once it behaves like a stroke. */
const STROKES = [
  "M20 88 C60 96 70 60 104 62 C138 64 150 40 180 46",
  "M20 62 C56 30 84 74 112 48 C142 22 156 44 180 34",
  "M20 34 C54 14 78 44 108 28 C140 12 158 30 180 20",
];

/**
 * The measurement traces stop behaving like data and start behaving like
 * strokes: they consolidate, curve, and warm up into Vaqfa's gold.
 */
export function ResearchToVaqfa() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=180%",
          scrub: 1,
          pin: ".interlude-stage",
          anticipatePin: 1,
        },
      });

      tl.to(".trace-tick", { opacity: 0, duration: 0.5, stagger: 0.02, ease: "none" }, 0);

      // Each trace consolidates into its own calligraphic stroke.
      gsap.utils.toArray<SVGPathElement>(".trace", root.current!).forEach((path, i) => {
        tl.to(path, { morphSVG: STROKES[i], duration: 1.4, ease: EASE.compose }, 0.2);
      });

      tl.to(".trace", { stroke: "#c8912f", strokeWidth: 2.2, duration: 1, ease: "none" }, 0.6)
        .to(".rv-wash", { opacity: 1, duration: 1.2, ease: "none" }, 0.8)
        .to(".trace", { opacity: 0, duration: 0.6, ease: "none" }, 1.9);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="interlude rv" ref={root} aria-hidden="true">
      <div className="interlude-stage">
        <div className="rv-wash" />
        <svg className="rv-svg" viewBox="0 0 200 120" role="presentation">
          <g stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round">
            <path className="trace" d="M20 90 L60 70 L100 78 L140 44 L180 52" />
            <path className="trace" d="M20 60 L60 56 L100 34 L140 62 L180 30" />
            <path className="trace" d="M20 30 L60 42 L100 22 L140 30 L180 18" />
          </g>
          <g className="trace-ticks" stroke="#ffffff" strokeWidth="0.6" opacity="0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <line className="trace-tick" key={i} x1={20 + i * 20} y1="102" x2={20 + i * 20} y2="108" />
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}
