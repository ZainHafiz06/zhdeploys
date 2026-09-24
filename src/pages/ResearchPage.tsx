import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSiteContent } from "../content/store";
import { setMeta } from "../lib/meta";
import "../styles/detail.css";

export default function ResearchPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  // Drafts render only for a signed-in owner; RLS refuses them to anyone else.
  const { content, loading } = useSiteContent({ includeDrafts: params.get("preview") === "1" });
  const entry = content.research.find((r) => r.slug === slug);

  useEffect(() => {
    if (!entry) return;
    const root = document.documentElement;
    root.style.setProperty("--bg", "#050505");
    root.style.setProperty("--fg", "#f2f2f0");
    root.style.setProperty("--accent", "#8fb8ff");
    setMeta({
      title: `${entry.title} | Research`,
      description: entry.oneLiner || entry.subtitle || entry.title,
      canonical: `/research/${entry.slug}`,
      noindex: !entry.published,
    });
  }, [entry]);

  if (!entry) {
    return (
      <main className="detail">
        <p>{loading ? "Loading" : "That entry doesn't exist."}</p>
        <Link className="meta-link" to="/">
          Back to the story
        </Link>
      </main>
    );
  }

  const sections: Array<[string, string | undefined]> = [
    ["Abstract", entry.abstract],
    ["Motivation", entry.motivation],
    ["Question", entry.researchQuestion],
    ["Method", entry.methodology],
  ];

  const lists: Array<[string, string[]]> = [
    ["Models", entry.models],
    ["Datasets", entry.datasets],
    ["Measured against", entry.metrics],
    ["Findings", entry.results],
    ["Limitations", entry.limitations],
    ["Authors", entry.authors],
  ];

  return (
    <main className="detail">
      <Link className="detail-back meta-link" to={`/#${entry.slug}`} data-cursor="BACK">
        ← The story
      </Link>

      <header className="detail-head">
        <h1 className="u-display detail-title">{entry.title}</h1>
        {entry.subtitle && <p className="detail-line">{entry.subtitle}</p>}
        {entry.status && <p className="u-label">{entry.status}</p>}
      </header>

      <div className="detail-body">
        {sections.map(([label, value]) =>
          value ? (
            <section key={label}>
              <h2 className="u-label">{label}</h2>
              <p className="u-measure">{value}</p>
            </section>
          ) : null,
        )}

        {lists.map(([label, items]) =>
          items.length ? (
            <section key={label}>
              <h2 className="u-label">{label}</h2>
              <ul className="detail-list">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null,
        )}

        {entry.figures.length > 0 && (
          <section className="detail-gallery">
            {entry.figures.map((f) => (
              <figure key={f.id}>
                <img src={f.url} alt={f.alt ?? ""} loading="lazy" decoding="async" />
                {f.caption && <figcaption className="u-label">{f.caption}</figcaption>}
              </figure>
            ))}
          </section>
        )}

        <div className="meta-links">
          {entry.paperUrl && (
            <a className="meta-link" href={entry.paperUrl} target="_blank" rel="noreferrer">
              Paper
            </a>
          )}
          {entry.pdfUrl && (
            <a className="meta-link" href={entry.pdfUrl} target="_blank" rel="noreferrer">
              PDF
            </a>
          )}
          {entry.githubUrl && (
            <a className="meta-link" href={entry.githubUrl} target="_blank" rel="noreferrer">
              Repository
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
