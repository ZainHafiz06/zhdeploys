import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { projectToRow } from "../../content/store";
import type { Project, SiteContent } from "../../content/types";
import { AreaField, Field, ListField, TextField, Toggle } from "../fields";
import { slugify } from "../slugify";
import { MediaPicker } from "./MediaPicker";

const blank = (order: number): Project => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  stack: [],
  responsibilities: [],
  outcomes: [],
  gallery: [],
  blocks: [],
  palette: { background: "#050505", foreground: "#f2f2f0", accent: "#f2f2f0" },
  order,
  published: false,
  featured: false,
});

export function ProjectsPanel({ content, reload }: { content: SiteContent; reload: () => Promise<void> }) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const projects = [...content.projects].sort((a, b) => a.order - b.order);

  const save = async (project: Project) => {
    const row = projectToRow({ ...project, slug: project.slug || slugify(project.title) });
    const { error } = await supabase!.from("projects").upsert(row);
    setStatus(error ? error.message : `Saved ${project.title}`);
    if (!error) {
      setEditing(null);
      await reload();
    }
  };

  const remove = async (project: Project) => {
    if (!confirm(`Delete “${project.title}” permanently? This cannot be undone.`)) return;
    const { error } = await supabase!.from("projects").delete().eq("id", project.id);
    setStatus(error ? error.message : `Deleted ${project.title}`);
    await reload();
  };

  const duplicate = async (project: Project) => {
    const copy: Project = {
      ...project,
      id: crypto.randomUUID(),
      slug: `${project.slug}-copy`,
      title: `${project.title} (copy)`,
      order: projects.length + 1,
      published: false,
    };
    await save(copy);
  };

  const reorder = async (fromId: string, toId: string) => {
    const list = [...projects];
    const from = list.findIndex((p) => p.id === fromId);
    const to = list.findIndex((p) => p.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    const rows = list.map((p, i) => projectToRow({ ...p, order: i + 1 }));
    const { error } = await supabase!.from("projects").upsert(rows);
    setStatus(error ? error.message : "Order updated");
    await reload();
  };

  if (editing) {
    return (
      <ProjectEditor
        project={editing}
        onCancel={() => setEditing(null)}
        onSave={save}
        status={status}
      />
    );
  }

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>Projects</h1>
        <button className="btn" onClick={() => setEditing(blank(projects.length + 1))}>
          New project
        </button>
      </header>
      {status && <p className="studio-status">{status}</p>}

      <ul className="rows">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`row${dragId === project.id ? " is-dragging" : ""}`}
            draggable
            onDragStart={() => setDragId(project.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) void reorder(dragId, project.id);
              setDragId(null);
            }}
            onDragEnd={() => setDragId(null)}
          >
            <span className="row-handle" aria-hidden="true">
              ⠿
            </span>
            <span className="row-index">{String(project.order).padStart(2, "0")}</span>
            <span className="row-title">{project.title || "Untitled"}</span>
            <span className={`row-state${project.published ? " is-live" : ""}`}>
              {project.published ? "Live" : "Draft"}
            </span>
            <span className="row-actions">
              <a className="btn btn-ghost" href={`/work/${project.slug}?preview=1`} target="_blank" rel="noreferrer">
                Preview
              </a>
              <button className="btn btn-ghost" onClick={() => setEditing(project)}>
                Edit
              </button>
              <button className="btn btn-ghost" onClick={() => void save({ ...project, published: !project.published })}>
                {project.published ? "Unpublish" : "Publish"}
              </button>
              <button className="btn btn-ghost" onClick={() => void duplicate(project)}>
                Duplicate
              </button>
              <button className="btn btn-ghost btn-danger" onClick={() => void remove(project)}>
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProjectEditor({
  project,
  onCancel,
  onSave,
  status,
}: {
  project: Project;
  onCancel: () => void;
  onSave: (p: Project) => Promise<void>;
  status: string | null;
}) {
  const [draft, setDraft] = useState<Project>(project);
  const set = <K extends keyof Project>(key: K, value: Project[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>{draft.title || "New project"}</h1>
        <div className="panel-head-actions">
          <a className="btn btn-ghost" href={`/work/${draft.slug}?preview=1`} target="_blank" rel="noreferrer">
            Preview
          </a>
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn" onClick={() => void onSave(draft)}>
            Save
          </button>
        </div>
      </header>
      {status && <p className="studio-status">{status}</p>}

      <div className="editor-grid">
        <TextField label="Title" value={draft.title} onChange={(v) => set("title", v)} />
        <TextField
          label="Slug"
          value={draft.slug}
          onChange={(v) => set("slug", slugify(v))}
          hint={`/work/${draft.slug || slugify(draft.title)}`}
        />
        <TextField label="Short title" value={draft.shortTitle ?? ""} onChange={(v) => set("shortTitle", v)} />
        <TextField label="Year" value={draft.year ?? ""} onChange={(v) => set("year", v)} />
        <TextField label="Type" value={draft.type ?? ""} onChange={(v) => set("type", v)} />
        <TextField label="Role" value={draft.role ?? ""} onChange={(v) => set("role", v)} />
        <TextField label="Status" value={draft.status ?? ""} onChange={(v) => set("status", v)} />

        <AreaField
          label="Story one-liner"
          rows={2}
          value={draft.oneLiner ?? ""}
          onChange={(v) => set("oneLiner", v)}
          hint="The line that carries this chapter in the story."
        />
        <AreaField label="Summary" value={draft.summary ?? ""} onChange={(v) => set("summary", v)} />
        <AreaField label="Description" rows={6} value={draft.description ?? ""} onChange={(v) => set("description", v)} />
        <AreaField label="Story context" value={draft.storyContext ?? ""} onChange={(v) => set("storyContext", v)} />

        <ListField label="Stack" value={draft.stack} onChange={(v) => set("stack", v)} />
        <ListField label="Responsibilities" value={draft.responsibilities} onChange={(v) => set("responsibilities", v)} />
        <ListField label="Outcomes" value={draft.outcomes} onChange={(v) => set("outcomes", v)} />

        <TextField label="Live URL" value={draft.externalUrl ?? ""} onChange={(v) => set("externalUrl", v)} />
        <TextField label="Repository URL" value={draft.githubUrl ?? ""} onChange={(v) => set("githubUrl", v)} />
        <TextField label="Case study URL" value={draft.caseStudyUrl ?? ""} onChange={(v) => set("caseStudyUrl", v)} />

        <MediaPicker label="Logo" value={draft.logo} onChange={(m) => set("logo", m)} />
        <MediaPicker label="Hero media" value={draft.heroMedia} onChange={(m) => set("heroMedia", m)} />
        <MediaPicker label="Video" value={draft.video} onChange={(m) => set("video", m)} kind="video" />

        <Field label="Palette" hint="Background, foreground, accent — the world colours this chapter hands the site.">
          <div className="palette-row">
            {(["background", "foreground", "accent"] as const).map((key) => (
              <span className="palette-swatch" key={key}>
                <input
                  type="color"
                  value={draft.palette[key]}
                  onChange={(e) => set("palette", { ...draft.palette, [key]: e.target.value })}
                  aria-label={key}
                />
                <input
                  value={draft.palette[key]}
                  onChange={(e) => set("palette", { ...draft.palette, [key]: e.target.value })}
                  aria-label={`${key} hex`}
                />
              </span>
            ))}
          </div>
        </Field>

        <div className="editor-toggles">
          <Toggle label="Published" checked={draft.published} onChange={(v) => set("published", v)} />
          <Toggle label="Featured" checked={draft.featured} onChange={(v) => set("featured", v)} />
        </div>

        <GalleryEditor
          gallery={draft.gallery}
          onChange={(gallery) => set("gallery", gallery)}
        />
      </div>
    </section>
  );
}

function GalleryEditor({
  gallery,
  onChange,
}: {
  gallery: Project["gallery"];
  onChange: (g: Project["gallery"]) => void;
}) {
  return (
    <Field label="Gallery">
      <div className="gallery-editor">
        {gallery.map((item, i) => (
          <div className="gallery-item" key={item.id}>
            <img src={item.url} alt="" />
            <input
              value={item.alt ?? ""}
              placeholder="Alt text"
              onChange={(e) => {
                const next = [...gallery];
                next[i] = { ...item, alt: e.target.value };
                onChange(next);
              }}
            />
            <button className="btn btn-ghost btn-danger" onClick={() => onChange(gallery.filter((g) => g.id !== item.id))}>
              Remove
            </button>
          </div>
        ))}
        <MediaPicker
          label="Add to gallery"
          value={undefined}
          onChange={(m) => m && onChange([...gallery, m])}
        />
      </div>
    </Field>
  );
}
