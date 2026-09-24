import Lenis from "lenis";
import { prefersReducedMotion } from "./useReducedMotion";

let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}

/** Scrolls to an element through Lenis when it is running. */
export function scrollToSection(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { duration: 1.4, offset: 0 });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}

/** Scrolls to an absolute document offset. Long jumps get more time. */
export function scrollToY(y: number) {
  const lenis = getLenis();
  if (lenis) {
    const distance = Math.abs(window.scrollY - y) / window.innerHeight;
    lenis.scrollTo(y, { duration: Math.min(3.2, 1 + distance * 0.18) });
  } else {
    window.scrollTo({ top: y, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }
}
