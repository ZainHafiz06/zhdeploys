import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { isLowPower } from "../../motion/useDeviceTier";

const GLYPHS = ".:'`~/";

interface Particle {
  x: number;
  y: number;
  vy: number;
  phase: number;
  drift: number;
  life: number;
  glyph: number;
}

/**
 * Typographic vapour: loose streams of characters rising, drifting, swapping
 * themselves for a neighbouring glyph and dissolving near the top.
 */
export function AsciiVapor({ streams = 3 }: { streams?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const perStream = isLowPower() ? 8 : 14;
    const count = streams * perStream;
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();

    const reset = (p: Particle, initial = false) => {
      const lane = Math.floor(Math.random() * streams);
      const laneX = ((lane + 0.5) / streams) * width;
      p.x = laneX + (Math.random() - 0.5) * width * 0.16;
      p.y = initial ? Math.random() * height : height + Math.random() * 20;
      p.vy = 10 + Math.random() * 14;
      p.phase = Math.random() * Math.PI * 2;
      p.drift = 4 + Math.random() * 10;
      p.life = 0;
      p.glyph = Math.floor(Math.random() * GLYPHS.length);
    };

    for (let i = 0; i < count; i++) {
      const p: Particle = { x: 0, y: 0, vy: 0, phase: 0, drift: 0, life: 0, glyph: 0 };
      reset(p, true);
      particles.push(p);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const observer = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    observer.observe(canvas);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const size = Math.max(9, Math.min(14, width * 0.03));
      ctx.font = `${size}px "Kode Mono", ui-monospace, monospace`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      for (const p of particles) {
        p.life += dt;
        p.y -= p.vy * dt;
        p.x += Math.sin(p.phase + p.life * 0.8) * p.drift * dt;
        // Occasionally swap for a neighbouring glyph.
        if (Math.random() < dt * 1.2) {
          p.glyph = (p.glyph + (Math.random() < 0.5 ? 1 : GLYPHS.length - 1)) % GLYPHS.length;
        }

        const t = 1 - p.y / height; // 0 at bottom, 1 at top
        const alpha = Math.max(0, Math.min(1, Math.sin(Math.min(1, t) * Math.PI))) * 0.5;
        if (p.y < -10) reset(p);

        ctx.fillStyle = `rgba(242,242,240,${alpha.toFixed(3)})`;
        ctx.fillText(GLYPHS[p.glyph], p.x, p.y);
      }
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [streams, reduced]);

  return <canvas ref={canvasRef} className="vapor" aria-hidden="true" />;
}
