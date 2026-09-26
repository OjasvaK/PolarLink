import type { ImageCredit } from "@/lib/image-credits";
import { Slideshow } from "./slideshow";

type ProgramSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  images: readonly ImageCredit[];
  overlayFrom: string;
};

export function ProgramSection({
  eyebrow,
  title,
  description,
  images,
  overlayFrom,
}: ProgramSectionProps) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-black">
      <Slideshow images={images} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, black 0%, ${overlayFrom} 45%, transparent 85%)`,
        }}
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
          {eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          {title}
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-lg text-white/75">
          {description}
        </p>
      </div>
    </section>
  );
}
