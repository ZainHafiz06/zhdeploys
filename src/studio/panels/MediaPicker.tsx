import { useRef, useState } from "react";
import type { MediaAsset, MediaKind } from "../../content/types";
import { uploadFile } from "./uploadFile";
import { Field } from "../fields";

/** Upload or paste a URL. Originals are stored untouched in the bucket. */
export function MediaPicker({
  label,
  value,
  onChange,
  kind,
}: {
  label: string;
  value?: MediaAsset;
  onChange: (m: MediaAsset | undefined) => void;
  kind?: MediaKind;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Field label={label}>
      <div className="media-picker">
        {value?.url ? (
          <div className="media-preview">
            {value.kind === "video" ? (
              <video src={value.url} muted playsInline />
            ) : (
              <img src={value.url} alt="" />
            )}
            <button className="btn btn-ghost btn-danger" onClick={() => onChange(undefined)}>
              Clear
            </button>
          </div>
        ) : null}

        <input
          placeholder="https:// or /projects/"
          value={value?.url ?? ""}
          onChange={(e) =>
            onChange(
              e.target.value
                ? { id: value?.id ?? crypto.randomUUID(), url: e.target.value, kind: kind ?? "image", alt: value?.alt }
                : undefined,
            )
          }
        />
        <input
          placeholder="Alt text"
          value={value?.alt ?? ""}
          onChange={(e) => value && onChange({ ...value, alt: e.target.value })}
        />

        <input
          ref={inputRef}
          type="file"
          hidden
          accept={kind === "video" ? "video/*" : "image/*,video/*,application/pdf"}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setError(null);
            try {
              onChange(await uploadFile(file));
            } catch (err) {
              setError((err as Error).message);
            }
            setBusy(false);
            e.target.value = "";
          }}
        />
        <button className="btn btn-ghost" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Uploading" : "Upload"}
        </button>
        {error && <span className="studio-error">{error}</span>}
      </div>
    </Field>
  );
}
