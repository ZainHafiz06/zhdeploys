import { MEDIA_BUCKET, supabase } from "../../lib/supabase";
import type { MediaAsset, MediaKind } from "../../content/types";

export async function uploadFile(file: File): Promise<MediaAsset> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase!.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase!.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  const kind: MediaKind = file.type.startsWith("video")
    ? "video"
    : file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/svg+xml"
        ? "svg"
        : "image";
  return { id: path, url: data.publicUrl, kind, alt: "" };
}

