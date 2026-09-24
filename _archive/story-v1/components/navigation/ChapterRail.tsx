import { useEffect, useState } from "react";
import { scrollToSection } from "../../motion/lenis";
import type { Chapter } from "../../content/types";
import { chapterTitle } from "../../content/store";

interface Props {
  chapters: Chapter[];
  activeId: string | null;
  progress: number;
  onOpenIndex: () => void;
}

/** Minimal chapter index. Collapses to markers until hovered or focused. */
export function ChapterRail({ chapters, activeId, progress, onOpenIndex }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      className={`rail${expanded ? " is-expanded" : ""}`}
      aria-label="Chapters"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
    >
      <ol className="rail-list">
        {chapters.map((chapter, i) => {
          const isActive = chapter.id === activeId;
          return (
            <li key={chapter.id}>
              <button
                type="button"
                className={`rail-item${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollToSection(`#${chapter.slug}`)}
                data-cursor="GO"
              >
                <span className="rail-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="rail-name">{chapterTitle(chapter)}</span>
                <span className="rail-mark" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>

      <button type="button" className="rail-index" onClick={onOpenIndex} data-cursor="OPEN">
        <span className="rail-num">—</span>
        <span className="rail-name">Links</span>
      </button>

      <div className="rail-progress" aria-hidden="true">
        <span style={{ transform: `scaleY(${progress})` }} />
      </div>
    </nav>
  );
}
