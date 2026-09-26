"use client";

import { useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestUpload } from "@/app/submissions/upload-actions";
import { formatBytes, uploadBuckets, type UploadBucket } from "@/lib/upload-rules";

type Status =
  | { state: "idle" }
  | { state: "uploading"; name: string }
  | { state: "done"; name: string }
  | { state: "error"; message: string };

// A link input with an "Upload file" button beside it. Uploading sends the
// file straight to Supabase Storage and fills the input with its public URL,
// so the form still submits a plain link either way.
export function UploadField({
  bucket,
  inputProps,
}: {
  bucket: UploadBucket;
  inputProps: ComponentProps<"input">;
}) {
  const urlRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const rules = uploadBuckets[bucket];

  async function upload(file: File) {
    if (file.size > rules.maxBytes) {
      setStatus({ state: "error", message: `Files must be smaller than ${formatBytes(rules.maxBytes)}.` });
      return;
    }
    setStatus({ state: "uploading", name: file.name });
    const ticket = await requestUpload({
      bucket,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
    if (!ticket.ok) {
      setStatus({ state: "error", message: ticket.error });
      return;
    }
    const response = await fetch(ticket.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": ticket.contentType },
      body: file,
    }).catch(() => null);
    if (!response?.ok) {
      setStatus({ state: "error", message: "The upload failed. Please try again." });
      return;
    }
    if (urlRef.current) urlRef.current.value = ticket.publicUrl;
    setStatus({ state: "done", name: file.name });
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <Input ref={urlRef} {...inputProps} type="url" inputMode="url" placeholder="https://" />
        <input
          ref={fileRef}
          type="file"
          accept={rules.accept}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={status.state === "uploading"}
          onClick={() => fileRef.current?.click()}
        >
          {status.state === "uploading" ? "Uploading…" : "Upload File"}
        </Button>
      </div>
      <p aria-live="polite" className="text-sm empty:hidden">
        {status.state === "uploading" && <span className="text-muted-foreground">Uploading {status.name}…</span>}
        {status.state === "done" && <span className="text-muted-foreground">Uploaded {status.name}.</span>}
        {status.state === "error" && <span className="text-destructive">{status.message}</span>}
      </p>
    </div>
  );
}
