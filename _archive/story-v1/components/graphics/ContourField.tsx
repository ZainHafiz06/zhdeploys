import { useEffect, useRef } from "react";

/**
 * Original procedural topography: value noise sampled on a grid, then iso-lines
 * extracted with marching squares. Drawn once per size and drifted with a
 * transform, so it costs nothing per frame.
 */

function hash(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = smooth(x - xi);
  const yf = smooth(y - yi);
  const a = hash(xi, yi, seed);
  const b = hash(xi + 1, yi, seed);
  const c = hash(xi, yi + 1, seed);
  const d = hash(xi + 1, yi + 1, seed);
  return (a * (1 - xf) + b * xf) * (1 - yf) + (c * (1 - xf) + d * xf) * yf;
}

function fbm(x: number, y: number, seed: number): number {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    v += valueNoise(x * freq, y * freq, seed + i) * amp;
    amp *= 0.5;
    freq *= 2.07;
  }
  return v;
}

interface Props {
  opacity?: number;
  /** Lines per unit — lower is calmer. */
  levels?: number;
  className?: string;
}

export function ContourField({ opacity = 0.028, levels = 16, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cell = 12;
      const cols = Math.ceil(w / cell) + 1;
      const rows = Math.ceil(h / cell) + 1;
      const field = new Float32Array(cols * rows);
      // Large, slow features — the field must read as quiet texture, not noise.
      const scale = 0.0062;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Domain warp gives the organic, map-like wander.
          const px = x * cell * scale;
          const py = y * cell * scale;
          const wx = px + fbm(px * 0.5, py * 0.5, 11) * 1.1;
          const wy = py + fbm(px * 0.5 + 5.2, py * 0.5 + 1.3, 23) * 1.1;
          field[y * cols + x] = fbm(wx, wy, 3);
        }
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = getComputedStyle(canvas).color;
      ctx.globalAlpha = 1;
      ctx.beginPath();

      const at = (x: number, y: number) => field[y * cols + x];

      for (let l = 1; l < levels; l++) {
        const iso = l / levels;
        for (let y = 0; y < rows - 1; y++) {
          for (let x = 0; x < cols - 1; x++) {
            const tl = at(x, y);
            const tr = at(x + 1, y);
            const br = at(x + 1, y + 1);
            const bl = at(x, y + 1);
            const idx =
              (tl > iso ? 8 : 0) | (tr > iso ? 4 : 0) | (br > iso ? 2 : 0) | (bl > iso ? 1 : 0);
            if (idx === 0 || idx === 15) continue;

            const x0 = x * cell;
            const y0 = y * cell;
            const top = { x: x0 + cell * ((iso - tl) / (tr - tl)), y: y0 };
            const right = { x: x0 + cell, y: y0 + cell * ((iso - tr) / (br - tr)) };
            const bottom = { x: x0 + cell * ((iso - bl) / (br - bl)), y: y0 + cell };
            const left = { x: x0, y: y0 + cell * ((iso - tl) / (bl - tl)) };

            const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
            };

            switch (idx) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(left, top); break;
              case 5: seg(left, top); seg(bottom, right); break;
              case 10: seg(left, bottom); seg(top, right); break;
            }
          }
        }
      }
      ctx.stroke();
    };

    render();
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [levels]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ opacity, color: "var(--fg)" }}
    />
  );
}
