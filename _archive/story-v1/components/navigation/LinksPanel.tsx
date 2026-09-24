import { useEffect, useRef } from "react";
import type { SiteLink } from "../../content/types";

interface Props {
  links: SiteLink[];
  open: boolean;
  onClose: () => void;
}

/** Closing credits, reachable at any point without scrolling the whole story. */
export function LinksPanel({ links, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={`links-panel${open ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Links"
      aria-hidden={!open}
      ref={panelRef}
    >
      <button type="button" className="links-close" onClick={onClose} data-cursor="CLOSE">
        Close
      </button>
      <ul className="links-list">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target={link.openInNewTab ? "_blank" : undefined}
              rel={link.openInNewTab ? "noreferrer noopener" : undefined}
              data-cursor="OPEN"
            >
              <span className="links-label">{link.label}</span>
              {link.description ? <span className="links-desc">{link.description}</span> : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
