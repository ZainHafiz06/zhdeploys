import { useMemo, useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../../motion/core";
import { FragmentField, type FragmentHandle } from "../graphics/FragmentField";
import { useReducedMotion } from "../../motion/useReducedMotion";

/** The Nite outline, in normalised coordinates, as straight segments. */
const OUTLINE = [
  { x1: 0.12, y1: 0.08, x2: 0.78, y2: 0.08 },
  { x1: 0.78, y1: 0.08, x2: 0.9, y2: 0.2 },
  { x1: 0.9, y1: 0.2, x2: 0.9, y2: 0.94 },
  { x1: 0.9, y1: 0.94, x2: 0.66, y2: 0.94 },
  { x1: 0.66, y1: 0.94, x2: 0.66, y2: 0.5 },
  { x1: 0.66, y1: 0.5, x2: 0.12, y2: 0.5 },
  { x1: 0.12, y1: 0.5, x2: 0.12, y2: 0.08 },
  { x1: 0.12, y1: 0.56, x2: 0.36, y2: 0.56 },
  { x1: 0.36, y1: 0.56, x2: 0.36, y2: 0.94 },
  { x1: 0.36, y1: 0.94, x2: 0.12, y2: 0.94 },
  { x1: 0.12, y1: 0.94, x2: 0.12, y2: 0.56 },
];

/**
 * The outline fragments into points, the points drift off their paths, and
 * depth appears — the page leaves flat typography for dimensional space.
 */
export function NiteToMun() {
  const root = useRef<HTMLElement>(null);
  const handleRef = useRef<FragmentHandle>({ progress: 0 });
  const reduced = useReducedMotion();
  const segments = useMemo(() => OUTLINE, []);

  useGSAP(
    () => {
      if (reduced) {
        handleRef.current.progress = 0.6;
        return;
      }
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "+=170%",
        scrub: true,
        pin: ".interlude-stage",
        anticipatePin: 1,
        onUpdate: (self) => {
          handleRef.current.progress = self.progress;
        },
      });

      gsap.fromTo(
        ".fragment-caption",
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=60%", scrub: true },
        },
      );
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="interlude" ref={root} aria-hidden="true">
      <div className="interlude-stage">
        <FragmentField segments={segments} handleRef={handleRef} />
      </div>
    </section>
  );
}
