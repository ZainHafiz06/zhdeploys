import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSiteContent } from "../content/store";
import { ChapterMeta } from "../components/project/ChapterMeta";
import { setMeta } from "../lib/meta";
import "../styles/detail.css";

/** Shareable, readable project page. Inherits the project's own palette. */
export default function WorkPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  // Drafts render only for a signed-in owner; RLS refuses them to anyone else.
  const { content, loading } = useSiteContent({ includeDrafts: params.get("preview") === "1" });
  const project = content.projects.find((p) => p.slug === slug);

  useEffect(() => {
    if (!project) return;
    const root = document.documentElement;
    root.style.setProperty("--bg", project.palette.background);
    root.style.setProperty("--fg", project.palette.foreground);
    root.style.setProperty("--accent", project.palette.accent);
    setMeta({
      title: `${project.title} — Zain Hafiz`,
      description: project.summary || project.oneLiner || `${project.title}, a chapter of High on Java.`,
      image: project.heroMedia?.url ?? project.logo?.url,
      canonical: `/work/${project.slug}`,
      noindex: !project.published,
    });
  }, [project]);

  if (!project) {
    return (
      <main className="detail">
        <p>{loading ? "Loading…" : "That chapter doesn't exist."}</p>
        <Link className="meta-link" to="/">
          Back to the story
        </Link>
      </main>
    );
  }

  return (
    <main className="detail">
      <Link className="detail-back meta-link" to={`/#${project.slug}`} data-cursor="BACK">
        ← The story
      </Link>

      <header className="detail-head">
        <h1 className="u-display detail-title">{project.title}</h1>
        {project.oneLiner && <p className="detail-line">{project.oneLiner}</p>}
      </header>

      {project.logo && (
        <img className="detail-plate" src={project.logo.url} alt={project.logo.alt ?? project.title} />
      )}

      <div className="detail-body">
        {project.summary && <p className="chapter-lede u-measure">{project.summary}</p>}
        {project.description && <p className="u-measure">{project.description}</p>}
        {project.storyContext && <p className="chapter-context u-measure">{project.storyContext}</p>}

        {project.responsibilities.length > 0 && (
          <section>
            <h2 className="u-label">Responsibilities</h2>
            <ul className="detail-list">
              {project.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        {project.outcomes.length > 0 && (
          <section>
            <h2 className="u-label">Outcomes</h2>
            <ul className="detail-list">
              {project.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        )}

        {project.blocks.map((block) => (
          <section className="detail-block" key={block.id}>
            {block.title && <h2 className="u-label">{block.title}</h2>}
            {block.kind === "quote" && block.body && <blockquote className="detail-quote">{block.body}</blockquote>}
            {block.kind === "code" && block.body && (
              <pre className="detail-code">
                <code>{block.body}</code>
              </pre>
            )}
            {block.kind === "metric" && (
              <p className="detail-metric">
                <span>{block.value}</span> {block.label}
              </p>
            )}
            {["text", "image", "video", "gallery", "comparison", "embed"].includes(block.kind) && block.body && (
              <p className="u-measure">{block.body}</p>
            )}
            {block.media?.map((m) =>
              m.kind === "video" ? (
                <video key={m.id} src={m.url} controls playsInline preload="none" />
              ) : (
                <img key={m.id} src={m.url} alt={m.alt ?? ""} loading="lazy" decoding="async" />
              ),
            )}
          </section>
        ))}

        {project.gallery.length > 0 && (
          <section className="detail-gallery">
            {project.gallery.map((m) => (
              <figure key={m.id}>
                <img src={m.url} alt={m.alt ?? ""} loading="lazy" decoding="async" />
                {m.caption && <figcaption className="u-label">{m.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        <ChapterMeta project={project} />
      </div>
    </main>
  );
}
