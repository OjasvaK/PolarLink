"use server";

import { requireRole } from "@/lib/auth-guard";
import { createSignedUpload } from "@/lib/storage";
import { formatBytes, resolveContentType, uploadBuckets } from "@/lib/upload-rules";

export type UploadTicket =
  | { ok: true; uploadUrl: string; publicUrl: string; contentType: string }
  | { ok: false; error: string };

export async function requestUpload(input: {
  bucket: string;
  fileName: string;
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  const user = await requireRole("RESEARCHER");

  if (input.bucket !== "media" && input.bucket !== "documents") {
    return { ok: false, error: "Unknown upload destination." };
  }
  const rules = uploadBuckets[input.bucket];
  const contentType = resolveContentType(input.bucket, input.fileName, input.contentType);
  if (!contentType) return { ok: false, error: "That file type isn't supported here." };
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > rules.maxBytes) {
    return { ok: false, error: `Files must be smaller than ${formatBytes(rules.maxBytes)}.` };
  }

  try {
    const signed = await createSignedUpload(input.bucket, user.id, rules.types[contentType]);
    return { ok: true, uploadUrl: signed.uploadUrl, publicUrl: signed.publicUrl, contentType };
  } catch {
    return { ok: false, error: "Upload is unavailable right now. You can paste a link instead." };
  }
}
