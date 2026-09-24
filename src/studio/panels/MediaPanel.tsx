import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_BUCKET, supabase } from "../../lib/supabase";
import { uploadFile } from "./uploadFile";

interface Item {
  name: string;
  path: string;
  url: string;
  size?: number;
  updatedAt?: string;
}

/** Media library: upload, preview, copy URL, delete. Originals stay intact. */
export function MediaPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const folders = new Set<string>();
    const { data: top } = await supabase!.storage.from(MEDIA_BUCKET).list("", { limit: 100 });
    (top ?? []).forEach((entry) => {
      if (!entry.id) folders.add(entry.name);
    });

    const collected: Item[] = [];
    for (const folder of folders) {
      const { data } = await supabase!.storage.from(MEDIA_BUCKET).list(folder, { limit: 200 });
      (data ?? []).forEach((f) => {
        const path = `${folder}/${f.name}`;
        collected.push({
          name: f.name,
          path,
          url: supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl,
          size: (f.metadata as { size?: number } | null)?.size,
          updatedAt: f.updated_at ?? undefined,
        });
      });
    }
    setItems(collected.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "")));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="panel">
      <header className="panel-head">
        <h1>Media</h1>
        <button className="btn" onClick={() => inputRef.current?.click()}>
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            for (const file of files) {
              try {
                await uploadFile(file);
              } catch (err) {
                setStatus((err as Error).message);
              }
            }
            e.target.value = "";
            await load();
          }}
        />
      </header>
      {status && <p className="studio-status">{status}</p>}

      <div className="media-grid">
        {items.map((item) => (
          <figure className="media-card" key={item.path}>
            {/\.(mp4|webm|mov)$/i.test(item.name) ? (
              <video src={item.url} muted playsInline />
            ) : /\.pdf$/i.test(item.name) ? (
              <span className="media-file">PDF</span>
            ) : (
              <img src={item.url} alt="" loading="lazy" />
            )}
            <figcaption>
              <span className="media-name">{item.name}</span>
              {item.size ? <span className="media-size">{Math.round(item.size / 1024)} KB</span> : null}
              <span className="media-card-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(item.url);
                    setStatus("URL copied");
                  }}
                >
                  Copy URL
                </button>
                <button
                  className="btn btn-ghost btn-danger"
                  onClick={async () => {
                    if (!confirm(`Delete ${item.name}?`)) return;
                    await supabase!.storage.from(MEDIA_BUCKET).remove([item.path]);
                    await load();
                  }}
                >
                  Delete
                </button>
              </span>
            </figcaption>
          </figure>
        ))}
        {items.length === 0 && <p className="studio-empty">Nothing uploaded yet.</p>}
      </div>
    </section>
  );
}
