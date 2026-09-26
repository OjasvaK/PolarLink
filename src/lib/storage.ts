import "server-only";

import { randomUUID } from "node:crypto";
import { uploadBuckets, type UploadBucket } from "@/lib/upload-rules";

// Supabase Storage over its REST API (no SDK needed). The browser uploads
// straight to Supabase using a one-time signed URL issued here, so large
// files never pass through the Next.js server. Buckets are public-read:
// objects live under an unguessable UUID path and are linked from content
// once published.

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  return { url, key };
}

export function publicObjectPrefix(bucket: UploadBucket) {
  return `${config().url}/storage/v1/object/public/${bucket}/`;
}

export async function createSignedUpload(bucket: UploadBucket, userId: string, extension: string) {
  const { url, key } = config();
  const path = `${userId}/${randomUUID()}.${extension}`;
  const response = await fetch(`${url}/storage/v1/object/upload/sign/${bucket}/${path}`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) {
    throw new Error(`Supabase refused the upload URL (${response.status}).`);
  }
  const { url: signedPath } = (await response.json()) as { url: string };
  return {
    uploadUrl: `${url}/storage/v1${signedPath}`,
    publicUrl: publicObjectPrefix(bucket) + path,
    maxBytes: uploadBuckets[bucket].maxBytes,
  };
}
