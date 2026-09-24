import { useEffect, useRef } from "react";
import { isLowPower } from "../../motion/useDeviceTier";
import { useReducedMotion } from "../../motion/useReducedMotion";

export interface FragmentHandle {
  /** 0 = points sit on the source outline, 1 = fully dispersed into depth. */
  progress: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Takes an outline (normalised 0..1 segments) and disperses it into a field of
 * points with depth. Carries the Nite mark into MŪN's dimensional space.
 */
export function FragmentField({
  segments,
  handleRef,
}: {
  segments: Segment[];
  handleRef: React.MutableRefObject<FragmentHandle>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const density = isLowPower() ? 420 : 1100;
    const total = density;
    const src = new Float32Array(total * 2);
    const dst = new Float32Array(total * 3); // x, y, depth

    // Distribute along the outline by segment length.
    const lengths = segments.map((s) => Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
    const sum = lengths.reduce((a, b) => a + b, 0) || 1;
    let i = 0;
    segments.forEach((s, idx) => {
      const n = Math.max(2, Math.round((lengths[idx] / sum) * total));
      for (let k = 0; k < n && i < total; k++, i++) {
        const t = k / n;
        src[i * 2] = s.x1 + (s.x2 - s.x1) * t;
        src[i * 2 + 1] = s.y1 + (s.y2 - s.y1) * t;
        const angle = Math.random() * Math.PI * 2;
        // Enough drift to read as fragmentation, never enough to lose the mark.
        const radius = 0.03 + Math.random() * 0.17;
        dst[i * 3] = src[i * 2] + Math.cos(angle) * radius;
        dst[i * 3 + 1] = src[i * 2 + 1] + Math.sin(angle) * radius * 0.7;
        dst[i * 3 + 2] = Math.random();
      }
    });
    const used = i;

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let time = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const p = Math.min(1, Math.max(0, handleRef.current.progress));
      const ease = p * p * (3 - 2 * p);
      // The field also lifts away as it loosens, handing off to the sphere.
      const presence = 1 - Math.max(0, p - 0.82) / 0.18;
      ctx.clearRect(0, 0, width, height);

      // Fit the 0..1 outline into a centred box.
      const box = Math.min(width, height) * 0.66;
      const ox = (width - box) / 2;
      const oy = (height - box) / 2;

      for (let n = 0; n < used; n++) {
        const sx = src[n * 2];
        const sy = src[n * 2 + 1];
        const dx = dst[n * 3];
        const dy = dst[n * 3 + 1];
        const depth = dst[n * 3 + 2];
        const drift = ease * Math.sin(time * 0.6 + depth * 6.283) * 0.012;

        const x = ox + (sx + (dx - sx) * ease + drift) * box;
        const y = oy + (sy + (dy - sy) * ease) * box;
        const scale = 1 + (depth - 0.5) * ease * 1.4;
        const alpha = (0.5 + depth * 0.5) * presence;

        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        const r = Math.max(0.8, 1.7 * scale);
        ctx.fillRect(x - r / 2, y - r / 2, r, r);
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      time += Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) draw();
    };

    if (reduced) draw();
    else raf = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [segments, handleRef, reduced]);

  return <canvas ref={canvasRef} className="fragment-canvas" aria-hidden="true" />;
}
