import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, CustomEase, useGSAP);

/** Named eases with character — used instead of default ease-in-out everywhere. */
export const EASE = {
  /** Weighted entrance: fast commit, long settle. */
  enter: CustomEase.create("hoj-enter", "0.16, 1, 0.3, 1"),
  /** Exit that leans out before leaving. */
  exit: CustomEase.create("hoj-exit", "0.7, 0, 0.84, 0"),
  /** Cinematic composition move — slow start, long glide. */
  compose: CustomEase.create("hoj-compose", "0.65, 0.01, 0.05, 0.99"),
  /** Mechanical, for type and glyph snaps. */
  snap: CustomEase.create("hoj-snap", "0.9, 0.02, 0.2, 1"),
} as const;

/** Duration scale (seconds). */
export const DUR = {
  micro: 0.25,
  ui: 0.5,
  composition: 1.2,
} as const;

export { gsap, ScrollTrigger, useGSAP };
