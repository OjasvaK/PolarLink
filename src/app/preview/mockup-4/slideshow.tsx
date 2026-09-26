"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { ImageCredit } from "@/lib/image-credits";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function Slideshow({
  images,
  intervalMs = 5000,
}: {
  images: readonly ImageCredit[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs, reducedMotion]);

  const active = images[index];

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {images.map((image, i) => (
        <Image
          key={image.file}
          src={image.file}
          alt=""
          fill
          priority={i === 0}
          className="object-cover transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
          sizes="100vw"
        />
      ))}
      <a
        href={active.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-4 z-10 text-xs text-white/50 hover:text-white/80"
      >
        Photo: {active.credit} ({active.license})
      </a>
    </div>
  );
}
