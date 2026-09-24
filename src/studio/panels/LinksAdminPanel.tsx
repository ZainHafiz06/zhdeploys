import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { linkToRow } from "../../content/store";
import type { SiteContent, SiteLink } from "../../content/types";

export function LinksAdminPanel({ content, reload }: { content: SiteContent; reload: () => Promise<void> }) {
  const [status, setStatus] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const links = [...content.links].sort((a, b) => a.order - b.order);

  const save = async (link: SiteLink) => {
    const { error } = await supabase!.from("links").upsert(linkToRow(link));
    setStatus(error ? error.message : "Saved");
    await reload();
  };

  const add = async () => {
    await save({
      id: crypto.randomUUID(),
      label: "New link",
      url: "https://",
      order: links.length + 1,
      visible: false,
      openInNewTab: true,
    });
  };

  const remove = async (link: SiteLink) => {
    if (!confirm(`Delete “${link.label}”?`)) return;
    await supabase!.from("links").delete().eq("id", link.id);
    await reload();
  };

  const reorder = async (fromId: string, toId: string) => {
    const list = [...links];
    const from = list.findIndex((l) => l.id === fromId);
    const to = list.findIndex((l) => l.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    await supabase!.from("links").upsert(list.map((l, i) => linkToRow({ ...l, order: i + 1 })));
    await reload();
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>Links</h1>
        <button className="btn" onClick={() => void add()}>
          New link
        </button>
      </header>
      {status && <p className="studio-status">{status}</p>}

      <ul className="rows">
        {links.map((link) => (
          <li
            className="row row-form"
            key={link.id}
            draggable
            onDragStart={() => setDragId(link.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) void reorder(dragId, link.id);
              setDragId(null);
            }}
          >
            <span className="row-handle" aria-hidden="true">
              ⠿
            </span>
            <LinkRow link={link} onSave={save} onRemove={remove} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function LinkRow({
  link,
  onSave,
  onRemove,
}: {
  link: SiteLink;
  onSave: (l: SiteLink) => Promise<void>;
  onRemove: (l: SiteLink) => Promise<void>;
}) {
  const [draft, setDraft] = useState(link);
  return (
    <>
      <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} aria-label="Label" />
      <input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} aria-label="URL" />
      <input
        value={draft.description ?? ""}
        placeholder="Descriptor"
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        aria-label="Description"
      />
      <label className="toggle">
        <input
          type="checkbox"
          checked={draft.visible}
          onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
        />
        <span>Visible</span>
      </label>
      <label className="toggle">
        <input
          type="checkbox"
          checked={draft.openInNewTab}
          onChange={(e) => setDraft({ ...draft, openInNewTab: e.target.checked })}
        />
        <span>New tab</span>
      </label>
      <span className="row-actions">
        <button className="btn btn-ghost" onClick={() => void onSave(draft)}>
          Save
        </button>
        <button className="btn btn-ghost btn-danger" onClick={() => void onRemove(link)}>
          Delete
        </button>
      </span>
    </>
  );
}
