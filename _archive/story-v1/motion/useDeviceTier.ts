import { useEffect, useState } from "react";

export type DeviceTier = "mobile" | "tablet" | "desktop";

function read(): DeviceTier {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1180) return "tablet";
  return "desktop";
}

/** Coarse capability signal used to scale particle counts and scroll length. */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(read);
  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTier(read()));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return tier;
}

export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const touch = window.matchMedia("(hover: none)").matches;
  return cores <= 4 || touch;
}

/** Clamp WebGL pixel ratio so phones don't render 3x buffers. */
export function cappedDpr(max = 2): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, isLowPower() ? 1.5 : max);
}
