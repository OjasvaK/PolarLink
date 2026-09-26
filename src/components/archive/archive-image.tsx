import Image from "next/image";
import { cn } from "@/lib/utils";

const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;

// Uploaded images (Supabase Storage) go through next/image; images a
// submitter linked from elsewhere are shown as-is, since next/image only
// optimises allow-listed hosts.
export function ArchiveImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  let host: string | null = null;
  try {
    host = new URL(src).hostname;
  } catch {}

  if (host && host === supabaseHost) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={cn("absolute inset-0 size-full object-cover", className)}
    />
  );
}
