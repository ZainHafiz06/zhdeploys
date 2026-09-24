import { gsap, useGSAP, ScrollTrigger, EASE } from "./core";
import type { Palette } from "../content/types";

const current: Palette = {
  background: "#050505",
  foreground: "#f2f2f0",
  accent: "#f2f2f0",
};

let tween: gsap.core.Tween | null = null;

/**
 * Interpolates the three world variables between chapters. Done in JS rather
 * than with a CSS transition on registered custom properties, which stalls in
 * some browsers once several chapters have handed the palette back and forth.
 */
export function applyPalette(next: Palette, duration = 0.9) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const from = { ...current };
  const state = { p: 0 };

  tween?.kill();
  tween = gsap.to(state, {
    p: 1,
    duration,
    ease: EASE.compose,
    onUpdate: () => {
      current.background = gsap.utils.interpolate(from.background, next.background, state.p);
      current.foreground = gsap.utils.interpolate(from.foreground, next.foreground, state.p);
      current.accent = gsap.utils.interpolate(from.accent, next.accent, state.p);
      root.style.setProperty("--bg", current.background);
      root.style.setProperty("--fg", current.foreground);
      root.style.setProperty("--accent", current.accent);
    },
  });
}

/** Hands the world palette to a chapter while it owns the viewport. */
export function useWorldPalette(
  ref: React.RefObject<HTMLElement | null>,
  palette: Palette,
  options?: { start?: string; end?: string },
) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: options?.start ?? "top 55%",
        end: options?.end ?? "bottom 45%",
        onEnter: () => applyPalette(palette),
        onEnterBack: () => applyPalette(palette),
      });
    },
    { dependencies: [palette.background, palette.foreground, palette.accent], scope: ref },
  );
}
