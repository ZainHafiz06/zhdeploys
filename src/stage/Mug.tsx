import { useEffect, useRef } from "react";
import { useReducedMotion } from "../motion/useReducedMotion";

const GLYPHS = ".:'`~(){}/\\";

interface Wisp {
  x: number;
  y: number;
  vy: number;
  phase: number;
  sway: number;
  life: number;
  glyph: number;
}

/**
 * The laptop's opening screen: the "not my cup of tea" ASCII mug
 * (public/brand/mug-art.png, cropped from ascii-mug.png) with ASCII steam
 * curling up out of the cup and a slow light passing over the characters.
 */
export function Mug() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const wisps: Wisp[] = [];
    const spawn = (w: Wisp, initial: boolean) => {
      w.x = W * (0.3 + Math.random() * 0.4);
      w.y = initial ? Math.random() * H : H + Math.random() * 30;
      w.vy = 26 + Math.random() * 30;
      w.phase = Math.random() * Math.PI * 2;
      w.sway = 14 + Math.random() * 22;
      w.life = 0;
      w.glyph = Math.floor(Math.random() * GLYPHS.length);
    };
    for (let i = 0; i < 46; i++) {
      const w = {} as Wisp;
      spawn(w, true);
      wisps.push(w);
    }

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Only animate while the mug is actually on screen.
      if (root.style.opacity === "0") return;
      ctx.clearRect(0, 0, W, H);
      ctx.font = '22px "Kode Mono", ui-monospace, monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const w of wisps) {
        if (!reduced) {
          w.life += dt;
          w.y -= w.vy * dt;
          if (Math.random() < dt * 1.4) w.glyph = (w.glyph + 1) % GLYPHS.length;
          if (w.y < -20) spawn(w, false);
        }
        const t = 1 - w.y / H;
        const x = w.x + Math.sin(w.phase + w.life * 1.3 + t * 3) * w.sway * t;
        const alpha = Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * 0.75;
        ctx.fillStyle = `rgba(242,242,240,${alpha.toFixed(3)})`;
        ctx.fillText(GLYPHS[w.glyph], x, w.y);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div className="screen-mug" ref={rootRef}>
      <canvas className="mug-steam" ref={canvasRef} width={420} height={250} aria-hidden="true" />
      <div className="mug-art">
        <img src="/brand/mug-art.png" alt="ASCII coffee mug reading: not my cup of tea" />
        <i className="mug-sweep" aria-hidden="true" />
      </div>
    </div>
  );
}
