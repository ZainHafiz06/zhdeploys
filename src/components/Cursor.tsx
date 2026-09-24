import { useEffect, useRef, useState } from "react";

/**
 * A point that grows over interactive targets and takes their label
 * (OPEN, DRAG, INDEX). Pointer-device only; never replaces native affordances.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(fine.matches);
    const onChange = () => setEnabled(fine.matches);
    fine.addEventListener("change", onChange);
    return () => fine.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    let seen = false;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      // Stay hidden until the pointer is actually somewhere, then start there.
      if (!seen) {
        seen = true;
        x = tx;
        y = ty;
        dot.style.opacity = "1";
      }
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      if (target) {
        setActive(true);
        setLabel(target.dataset.cursor || null);
      } else {
        setActive(false);
        setLabel(null);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className={`cursor${active ? " is-active" : ""}${label ? " has-label" : ""}`}
      aria-hidden="true"
    >
      {label ? <span className="cursor-label">{label}</span> : null}
    </div>
  );
}
