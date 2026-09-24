import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { settingsToRow } from "../../content/store";
import type { SiteContent, SiteSettings } from "../../content/types";
import { AreaField, Field, TextField } from "../fields";
import { MediaPicker } from "./MediaPicker";

export function SettingsPanel({ content, reload }: { content: SiteContent; reload: () => Promise<void> }) {
  const [draft, setDraft] = useState<SiteSettings>(content.settings);
  const [status, setStatus] = useState<string | null>(null);
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = async () => {
    const { error } = await supabase!.from("settings").upsert(settingsToRow(draft));
    setStatus(error ? error.message : "Saved");
    await reload();
  };

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>Site</h1>
        <button className="btn" onClick={() => void save()}>
          Save
        </button>
      </header>
      {status && <p className="studio-status">{status}</p>}

      <div className="editor-grid">
        <TextField label="Intro line" value={draft.introLine} onChange={(v) => set("introLine", v)} />
        <TextField label="Ending line" value={draft.endingLine} onChange={(v) => set("endingLine", v)} />
        <TextField label="Signature" value={draft.signatureLine ?? ""} onChange={(v) => set("signatureLine", v)} />
        <TextField label="Résumé URL" value={draft.resumeUrl ?? ""} onChange={(v) => set("resumeUrl", v)} />
        <TextField label="SEO title" value={draft.seoTitle} onChange={(v) => set("seoTitle", v)} />
        <AreaField label="SEO description" value={draft.seoDescription} onChange={(v) => set("seoDescription", v)} />
        <MediaPicker
          label="Social preview image"
          value={draft.socialImage ? { id: "social", url: draft.socialImage, kind: "image" } : undefined}
          onChange={(m) => set("socialImage", m?.url)}
        />

        <Field label="Chapter transition lines" hint="Keyed by chapter slug. One per line as slug: line.">
          <textarea
            rows={8}
            value={Object.entries(draft.transitions)
              .map(([k, v]) => `${k}: ${v}`)
              .join("\n")}
            onChange={(e) => {
              const next: Record<string, string> = {};
              e.target.value.split("\n").forEach((row) => {
                const idx = row.indexOf(":");
                if (idx > 0) next[row.slice(0, idx).trim()] = row.slice(idx + 1).trim();
              });
              set("transitions", next);
            }}
          />
        </Field>
      </div>
    </section>
  );
}
