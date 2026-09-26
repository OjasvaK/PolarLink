"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import type { ImageCredit } from "@/lib/image-credits";
import { registerReveal } from "@/lib/scroll-reveal";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "depth";

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;
    return registerReveal(node);
  }, [reducedMotion]);

  return ref;
}

// Scroll-linked entrance for text: rises in as it enters, fades back out if
// you scroll back up past it.
export function Reveal({
  from = "up",
  className,
  children,
}: {
  from?: Direction;
  className?: string;
  children: ReactNode;
}) {
  const ref = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} data-reveal={from} className={className}>
      <div className="reveal-inner">{children}</div>
    </div>
  );
}

// A captioned photo that either slides in from a side or rises out of the
// background, tracking scroll position in both directions: it retreats the
// same way when you scroll back, and recedes as it leaves through the top.
export function RevealImage({
  image,
  from,
  frameClassName,
  className,
  sizes,
}: {
  image: ImageCredit;
  from: Direction;
  frameClassName: string;
  className?: string;
  sizes: string;
}) {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <figure ref={ref} data-reveal={from} className={cn("flex flex-col", className)}>
      <div className="reveal-inner flex flex-1 flex-col">
        <div
          className={cn(
            "relative overflow-hidden rounded-md bg-neutral-900",
            frameClassName
          )}
        >
          <Image
            src={image.file}
            alt={image.title}
            fill
            sizes={sizes}
            className="reveal-photo object-cover"
          />
        </div>
        <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-white/50">
          <span className="text-white/70">{image.title}</span>
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-white/80"
          >
            Photo: {image.credit} ({image.license})
          </a>
        </figcaption>
      </div>
    </figure>
  );
}
