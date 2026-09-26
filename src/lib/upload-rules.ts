// Upload limits shared by the browser (early feedback) and the server
// (enforcement). They mirror the bucket settings in Supabase, which enforce
// the same MIME types and size limit a third time.

export type UploadBucket = "media" | "documents";

export const uploadBuckets: Record<
  UploadBucket,
  { maxBytes: number; types: Record<string, string>; accept: string }
> = {
  media: {
    maxBytes: 50 * 1024 * 1024,
    types: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
      "video/mp4": "mp4",
      "video/webm": "webm",
    },
    accept: "image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm",
  },
  documents: {
    maxBytes: 50 * 1024 * 1024,
    types: {
      "application/pdf": "pdf",
      "text/csv": "csv",
      "text/plain": "txt",
      "application/json": "json",
      "application/zip": "zip",
      "application/x-netcdf": "nc",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    },
    accept: ".pdf,.csv,.txt,.json,.zip,.nc,.xlsx",
  },
};

// Browsers often report "" or a generic type for scientific formats such as
// NetCDF, so fall back to the file extension.
const byExtension: Record<string, string> = {
  nc: "application/x-netcdf",
  csv: "text/csv",
  json: "application/json",
  zip: "application/zip",
};

export function resolveContentType(bucket: UploadBucket, fileName: string, reported: string) {
  const types = uploadBuckets[bucket].types;
  if (types[reported]) return reported;
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  const guess = byExtension[extension];
  return guess && types[guess] ? guess : null;
}

export function formatBytes(bytes: number) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}
