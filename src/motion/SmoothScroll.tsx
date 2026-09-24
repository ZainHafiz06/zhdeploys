import { useEffect } from "react";
import Lenis from "lenis";
import { prefersReducedMotion } from "./useReducedMotion";
import { setLenis } from "./lenis";

/**
 * Lenis smooths the native scroll; everything scroll-driven reads the real
 * window scroll position, so it stays exact in both directions.
 * Disabled entirely under prefers-reduced-motion so native scroll stays exact.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.6,
      autoRaf: true,
    });
    setLenis(lenis);

    return () => {
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return <>{children}</>;
}
