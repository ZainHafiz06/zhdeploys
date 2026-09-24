import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, EASE } from "../../motion/core";
import { AsciiLogo } from "../graphics/AsciiLogo";
import { AsciiVapor } from "../graphics/AsciiVapor";
import { ContourField } from "../graphics/ContourField";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { useDeviceTier } from "../../motion/useDeviceTier";
import { applyPalette } from "../../motion/useWorldPalette";
import type { SiteLink } from "../../content/types";

interface Props {
  endingLine: string;
  links: SiteLink[];
}

/**
 * Everything collapses into code: the mark resolves out of unstable characters,
 * the mug sits beneath it, and the links read as closing credits.
 */
export function Finale({ endingLine, links }: Props) {
  const root = useRef<HTMLElement>(null);
  const settleRef = useRef(0);
  const reduced = useReducedMotion();
  const tier = useDeviceTier();

  useGSAP(
    () => {
      if (reduced) {
        settleRef.current = 1;
        return;
      }

      ScrollTrigger.create({
        trigger: ".finale-stage",
        start: "top 80%",
        end: "top 12%",
        scrub: true,
        onUpdate: (self) => {
          settleRef.current = self.progress;
        },
      });

      ScrollTrigger.create({
        trigger: root.current,
        start: "top 92%",
        onEnter: () =>
          applyPalette({ background: "#050505", foreground: "#f2f2f0", accent: "#f2f2f0" }),
        onEnterBack: () =>
          applyPalette({ background: "#050505", foreground: "#f2f2f0", accent: "#f2f2f0" }),
      });

      gsap.from(".finale-mug", {
        scrollTrigger: { trigger: ".finale-mug", start: "top 85%" },
        opacity: 0,
        y: 24,
        duration: 1.4,
        ease: EASE.enter,
      });

      gsap.from(".credit-item", {
        scrollTrigger: { trigger: ".credits", start: "top 85%" },
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: EASE.enter,
        stagger: 0.08,
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="finale" ref={root} id="high-on-java" aria-labelledby="finale-title">
      <div className="finale-contour" aria-hidden="true">
        <ContourField className="contour-canvas" opacity={0.055} />
      </div>

      <p className="finale-ending u-measure">{endingLine}</p>

      <div className="finale-stage">
        <h2 className="u-visually-hidden" id="finale-title">
          High on Java
        </h2>
        <AsciiLogo
          src="/brand/high-on-java.png"
          settleRef={settleRef}
          cols={tier === "mobile" ? 64 : tier === "tablet" ? 86 : 112}
          className="finale-ascii"
          alt="High on Java"
        />
      </div>

      <figure className="finale-mug">
        <div className="finale-mug-inner">
          <AsciiVapor streams={tier === "mobile" ? 2 : 3} />
          <img
            src="/brand/ascii-mug.png"
            alt="ASCII coffee mug reading: not my cup of tea"
            loading="lazy"
            decoding="async"
          />
        </div>
      </figure>

      <nav className="credits" aria-label="Links">
        <ul>
          {links.map((link) => (
            <li className="credit-item" key={link.id}>
              <a
                href={link.url}
                target={link.openInNewTab ? "_blank" : undefined}
                rel={link.openInNewTab ? "noreferrer noopener" : undefined}
                data-cursor="OPEN"
              >
                <span className="credit-label">{link.label}</span>
                {link.description && <span className="credit-desc">{link.description}</span>}
                <span className="credit-arrow" aria-hidden="true">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
