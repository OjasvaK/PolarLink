"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { heroCopy } from "@/lib/mock-landing-data";
import { imageCredits } from "@/lib/image-credits";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

const credit = imageCredits.nyAlesundAurora;

export function CinematicHero() {
  const imageRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const offset = window.scrollY * 0.25;
        if (imageRef.current) {
          imageRef.current.style.transform = `translateY(${offset}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-black">
      <div ref={imageRef} className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 ${reducedMotion ? "" : "hero-kenburns"}`}>
          <Image
            src={credit.file}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
        <Badge variant="secondary" className="mb-6 bg-white/10 text-white backdrop-blur">
          {heroCopy.eyebrow}
        </Badge>
        <h1 className="text-balance text-5xl font-extrabold tracking-tight sm:text-7xl">
          {heroCopy.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-xl text-white/80">
          {heroCopy.subheadline}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg">Explore the Archive</Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            Researcher Sign In
          </Button>
        </div>
      </div>

      <a
        href={credit.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-4 text-xs text-white/50 hover:text-white/80"
      >
        Photo: {credit.credit} ({credit.license})
      </a>

      <style>{`
        @keyframes hero-kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        .hero-kenburns {
          animation: hero-kenburns 20s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
}
