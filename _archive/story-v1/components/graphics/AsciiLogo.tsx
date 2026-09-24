import { useEffect, useRef } from "react";
import {
  glyphFor,
  loadImage,
  measureCellAspect,
  sampleImageToGrid,
  type AsciiGrid,
} from "./asciiFromImage";
import { useReducedMotion } from "../../motion/useReducedMotion";

interface Props {
  /** Source bitmap — the canonical HIGH ON JAVA mark. */
  src: string;
  /** 0 = sparse and unstable, 1 = crisp and settled. Driven by scroll. */
  settleRef: React.MutableRefObject<number>;
  cols?: number;
  className?: string;
  alt: string;
}

/**
 * Renders a bitmap mark as live ASCII. The grid comes from the image itself,
 * so the silhouette, spacing and counters are the artwork's, not a font's.
 */
const FONT = '"Kode Mono", ui-monospace, monospace';

export function AsciiLogo({ src, settleRef, cols = 108, className, alt }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<AsciiGrid | null>(null);
  const aspectRef = useRef(0.5);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    let raf = 0;
    let visible = true;
    const random = new Float32Array(4096);
    for (let i = 0; i < random.length; i++) random[i] = Math.random();

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "20%" },
    );
    observer.observe(canvas);

    const draw = (time: number) => {
      const grid = gridRef.current;
      const ctx = canvas.getContext("2d");
      if (!grid || !ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const cellW = width / grid.cols;
      // Line height derived from the measured advance width, so a full row of
      // characters spans the canvas exactly.
      const cellH = cellW / aspectRef.current;
      const height = cellH * grid.rows;

      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${cellH}px ${FONT}`;
      ctx.textBaseline = "top";
      ctx.fillStyle = getComputedStyle(canvas).color;

      const settle = Math.min(1, Math.max(0, settleRef.current));
      // A slow frame clock so characters flicker at a readable rate, not 60Hz.
      const tick = Math.floor(time / 90);

      for (let y = 0; y < grid.rows; y++) {
        let row = "";
        for (let x = 0; x < grid.cols; x++) {
          const i = y * grid.cols + x;
          const r = random[(i + tick * 131) % random.length];
          row += glyphFor(grid.coverage[i], settle, r);
        }
        ctx.fillText(row, 0, y * cellH);
      }
    };

    const loop = (time: number) => {
      if (!alive) return;
      if (visible) draw(time);
      raf = requestAnimationFrame(loop);
    };

    const start = async () => {
      await document.fonts?.ready;
      if (!alive) return;
      aspectRef.current = measureCellAspect(FONT);
      const img = await loadImage(src);
      if (!alive) return;
      gridRef.current = sampleImageToGrid(img, cols, aspectRef.current);
      if (reduced) {
        settleRef.current = 1;
        draw(0);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    void start();

    const onResize = () => draw(performance.now());
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [src, cols, reduced, settleRef]);

  return (
    <div className={className}>
      <canvas ref={canvasRef} aria-hidden="true" style={{ width: "100%", color: "var(--fg)" }} />
      <span className="u-visually-hidden">{alt}</span>
    </div>
  );
}
