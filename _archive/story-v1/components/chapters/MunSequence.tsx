import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, EASE, DUR } from "../../motion/core";
import { MunField, type MunFieldHandle } from "../graphics/MunField";
import { useWorldPalette } from "../../motion/useWorldPalette";
import { useReducedMotion } from "../../motion/useReducedMotion";
import { ChapterMeta } from "./ChapterMeta";
import { SplitLine } from "../typography/SplitLine";
import type { Project, Research } from "../../content/types";

interface Props {
  project: Project;
  research?: Research;
  index: number;
  researchIndex: number;
}

/**
 * MŪN and the research it opened share one continuous point field: the sphere
 * separates into a routing network rather than cutting to a new section.
 */
export function MunSequence({ project, research, index, researchIndex }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const munRef = useRef<HTMLElement>(null);
  const researchRef = useRef<HTMLElement>(null);
  const handleRef = useRef<MunFieldHandle>({ morph: 0, velocity: 0, opacity: 0 });
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();

  useWorldPalette(munRef, project.palette);

  // The WebGL layer only exists while this sequence is near the viewport.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setMounted((prev) => prev || entry.isIntersecting),
      { rootMargin: "60%" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (reduced) {
        handleRef.current.opacity = 1;
        handleRef.current.morph = 0;
        return;
      }

      // Presence of the field across the whole sequence.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 80%",
        end: "bottom 20%",
        onUpdate: (self) => {
          handleRef.current.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 3000);
        },
        onToggle: (self) => {
          handleRef.current.opacity = self.isActive ? 1 : 0;
        },
      });

      // Sphere → network, scrubbed across the MŪN/research boundary.
      ScrollTrigger.create({
        trigger: researchRef.current,
        start: "top 85%",
        end: "top 15%",
        scrub: true,
        onUpdate: (self) => {
          handleRef.current.morph = self.progress;
        },
      });

      gsap.from(".mun-reveal", {
        scrollTrigger: { trigger: munRef.current, start: "top 72%" },
        yPercent: 32,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.1,
      });

      gsap.fromTo(
        ".mun-plate",
        { opacity: 0, scale: 1.08 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: EASE.compose,
          scrollTrigger: { trigger: ".mun-plate", start: "top 85%", end: "top 40%", scrub: 1 },
        },
      );

      gsap.from(".research-reveal", {
        scrollTrigger: { trigger: researchRef.current, start: "top 68%" },
        yPercent: 24,
        opacity: 0,
        duration: DUR.composition,
        ease: EASE.enter,
        stagger: 0.09,
      });

      gsap.from(".metric-item", {
        scrollTrigger: { trigger: ".metric-list", start: "top 82%" },
        opacity: 0,
        x: -18,
        duration: 0.7,
        ease: EASE.snap,
        stagger: 0.07,
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <div className="mun-sequence" ref={root}>
      <div className="mun-layer" aria-hidden="true">
        {mounted && <MunField handleRef={handleRef} />}
      </div>

      <section className="chapter mun" ref={munRef} id={project.slug} aria-labelledby={`${project.slug}-title`}>
        <header className="chapter-head mun-head">
          <span className="chapter-num u-label">{String(index).padStart(2, "0")}</span>
          <h2 className="chapter-title u-display" id={`${project.slug}-title`}>
            {project.title}
          </h2>
          {project.oneLiner && <SplitLine className="chapter-line" text={project.oneLiner} />}
        </header>

        <div className="mun-body chapter-body">
          {project.summary && <p className="mun-reveal chapter-lede u-measure">{project.summary}</p>}
          {project.description && <p className="mun-reveal u-measure">{project.description}</p>}
          {project.storyContext && <p className="mun-reveal chapter-context u-measure">{project.storyContext}</p>}
          <div className="mun-reveal">
            <ChapterMeta project={project} />
          </div>
        </div>

        {project.logo && (
          <figure className="mun-plate-wrap">
            <img
              className="mun-plate"
              src={project.logo.url}
              alt={project.logo.alt ?? `${project.title} identity`}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="u-label">{project.title} — identity</figcaption>
          </figure>
        )}
      </section>

      {research && (
        <section
          className="chapter research"
          ref={researchRef}
          id={research.slug}
          aria-labelledby={`${research.slug}-title`}
        >
          <header className="chapter-head research-head">
            <span className="chapter-num u-label">{String(researchIndex).padStart(2, "0")} / Research</span>
            <h2 className="research-title u-display" id={`${research.slug}-title`}>
              {research.title}
            </h2>
            {research.subtitle && <p className="research-sub u-label">{research.subtitle}</p>}
            {research.oneLiner && <SplitLine className="chapter-line" text={research.oneLiner} />}
          </header>

          <div className="research-body">
            {research.researchQuestion && (
              <div className="research-reveal research-question">
                <span className="u-label">Question</span>
                <p className="u-measure">{research.researchQuestion}</p>
              </div>
            )}

            {research.abstract && (
              <div className="research-reveal">
                <span className="u-label">Abstract</span>
                <p className="u-measure">{research.abstract}</p>
              </div>
            )}

            {research.motivation && (
              <div className="research-reveal">
                <span className="u-label">Motivation</span>
                <p className="u-measure">{research.motivation}</p>
              </div>
            )}

            {research.methodology && (
              <div className="research-reveal">
                <span className="u-label">Method</span>
                <p className="u-measure">{research.methodology}</p>
              </div>
            )}

            {research.metrics.length > 0 && (
              <div className="research-reveal">
                <span className="u-label">Measured against</span>
                <ul className="metric-list">
                  {research.metrics.map((metric, i) => (
                    <li className="metric-item" key={metric}>
                      <span className="metric-index">{String(i + 1).padStart(2, "0")}</span>
                      <span className="metric-name">{metric}</span>
                      <span className="metric-trace" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ResearchList label="Models" items={research.models} />
            <ResearchList label="Datasets" items={research.datasets} />
            <ResearchList label="Findings" items={research.results} />
            <ResearchList label="Limitations" items={research.limitations} />

            <div className="research-reveal meta-links">
              <a className="meta-link" href={`/research/${research.slug}`} data-cursor="OPEN">
                Full entry
              </a>
              {research.paperUrl && (
                <a className="meta-link" href={research.paperUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
                  Paper
                </a>
              )}
              {research.pdfUrl && (
                <a className="meta-link" href={research.pdfUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
                  PDF
                </a>
              )}
              {research.githubUrl && (
                <a className="meta-link" href={research.githubUrl} target="_blank" rel="noreferrer" data-cursor="OPEN">
                  Repository
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ResearchList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="research-reveal">
      <span className="u-label">{label}</span>
      <ul className="research-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
