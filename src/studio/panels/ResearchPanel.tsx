import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { researchToRow } from "../../content/store";
import type { Research, SiteContent } from "../../content/types";
import { AreaField, Field, ListField, TextField, Toggle } from "../fields";
import { slugify } from "../slugify";
import { MediaPicker } from "./MediaPicker";

const blank = (order: number): Research => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  datasets: [],
  models: [],
  metrics: [],
  results: [],
  limitations: [],
  figures: [],
  authors: [],
  order,
  published: false,
});

export function ResearchPanel({ content, reload }: { content: SiteContent; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<Research | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const entries = [...content.research].sort((a, b) => a.order - b.order);

  const save = async (entry: Research) => {
    const { error } = await supabase!
      .from("research")
      .upsert(researchToRow({ ...entry, slug: entry.slug || slugify(entry.title) }));
    setStatus(error ? error.message : `Saved ${entry.title}`);
    if (!error) {
      setEditing(null);
      await reload();
    }
  };

  const remove = async (entry: Research) => {
    if (!confirm(`Delete “${entry.title}” permanently?`)) return;
    const { error } = await supabase!.from("research").delete().eq("id", entry.id);
    setStatus(error ? error.message : `Deleted ${entry.title}`);
    await reload();
  };

  if (editing) {
    const draft = editing;
    const set = <K extends keyof Research>(key: K, value: Research[K]) =>
      setEditing({ ...draft, [key]: value });

    return (
      <section className="panel">
        <header className="panel-head">
          <h1>{draft.title || "New research"}</h1>
          <div className="panel-head-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn" onClick={() => void save(draft)}>
              Save
            </button>
          </div>
        </header>
        {status && <p className="studio-status">{status}</p>}

        <div className="editor-grid">
          <TextField label="Title" value={draft.title} onChange={(v) => set("title", v)} />
          <TextField label="Slug" value={draft.slug} onChange={(v) => set("slug", slugify(v))} />
          <TextField label="Subtitle" value={draft.subtitle ?? ""} onChange={(v) => set("subtitle", v)} />

          <Field label="Attached to project" hint="Research appears directly after this project in the story.">
            <select
              value={draft.relatedProjectId ?? ""}
              onChange={(e) => set("relatedProjectId", e.target.value || undefined)}
            >
              <option value="">— none —</option>
              {content.projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>

          <AreaField label="Story one-liner" rows={2} value={draft.oneLiner ?? ""} onChange={(v) => set("oneLiner", v)} />
          <AreaField label="Abstract" rows={5} value={draft.abstract ?? ""} onChange={(v) => set("abstract", v)} />
          <AreaField label="Motivation" value={draft.motivation ?? ""} onChange={(v) => set("motivation", v)} />
          <AreaField label="Research question" value={draft.researchQuestion ?? ""} onChange={(v) => set("researchQuestion", v)} />
          <AreaField label="Methodology" rows={5} value={draft.methodology ?? ""} onChange={(v) => set("methodology", v)} />

          <ListField label="Datasets" value={draft.datasets} onChange={(v) => set("datasets", v)} />
          <ListField label="Models" value={draft.models} onChange={(v) => set("models", v)} />
          <ListField label="Metrics" value={draft.metrics} onChange={(v) => set("metrics", v)} />
          <ListField label="Findings" value={draft.results} onChange={(v) => set("results", v)} hint="Leave empty until there are real results." />
          <ListField label="Limitations" value={draft.limitations} onChange={(v) => set("limitations", v)} />
          <ListField label="Authors" value={draft.authors} onChange={(v) => set("authors", v)} />

          <TextField label="Affiliation" value={draft.affiliation ?? ""} onChange={(v) => set("affiliation", v)} />
          <TextField label="Status" value={draft.status ?? ""} onChange={(v) => set("status", v)} />
          <TextField label="Year" value={draft.year ?? ""} onChange={(v) => set("year", v)} />
          <TextField label="Paper URL" value={draft.paperUrl ?? ""} onChange={(v) => set("paperUrl", v)} />
          <TextField label="PDF URL" value={draft.pdfUrl ?? ""} onChange={(v) => set("pdfUrl", v)} />
          <TextField label="Repository URL" value={draft.githubUrl ?? ""} onChange={(v) => set("githubUrl", v)} />

          <MediaPicker
            label="Add figure"
            value={undefined}
            onChange={(m) => m && set("figures", [...draft.figures, m])}
          />
          {draft.figures.length > 0 && (
            <Field label="Figures">
              <div className="gallery-editor">
                {draft.figures.map((f, i) => (
                  <div className="gallery-item" key={f.id}>
                    <img src={f.url} alt="" />
                    <input
                      value={f.caption ?? ""}
                      placeholder="Caption"
                      onChange={(e) => {
                        const next = [...draft.figures];
                        next[i] = { ...f, caption: e.target.value };
                        set("figures", next);
                      }}
                    />
                    <button
                      className="btn btn-ghost btn-danger"
                      onClick={() => set("figures", draft.figures.filter((x) => x.id !== f.id))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Field>
          )}

          <div className="editor-toggles">
            <Toggle label="Published" checked={draft.published} onChange={(v) => set("published", v)} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>Research</h1>
        <button className="btn" onClick={() => setEditing(blank(entries.length + 1))}>
          New entry
        </button>
      </header>
      {status && <p className="studio-status">{status}</p>}

      <ul className="rows">
        {entries.map((entry) => (
          <li className="row" key={entry.id}>
            <span className="row-index">{String(entry.order).padStart(2, "0")}</span>
            <span className="row-title">{entry.title}</span>
            <span className={`row-state${entry.published ? " is-live" : ""}`}>
              {entry.published ? "Live" : "Draft"}
            </span>
            <span className="row-actions">
              <a className="btn btn-ghost" href={`/research/${entry.slug}?preview=1`} target="_blank" rel="noreferrer">
                Preview
              </a>
              <button className="btn btn-ghost" onClick={() => setEditing(entry)}>
                Edit
              </button>
              <button className="btn btn-ghost" onClick={() => void save({ ...entry, published: !entry.published })}>
                {entry.published ? "Unpublish" : "Publish"}
              </button>
              <button className="btn btn-ghost btn-danger" onClick={() => void remove(entry)}>
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
