"use client";

import { type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { heroCopy } from "@/lib/mock-landing-data";
import { imageCredits } from "@/lib/image-credits";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { usePolarMotion } from "@/components/landing/polar-motion-context";
import { PolarAuroraScene } from "@/components/landing/polar-aurora-scene";

const credit = imageCredits.nyAlesundAurora;

export function CinematicHero() {
  const reducedMotion = usePrefersReducedMotion();
  // The aurora + snow scene and the photo's slow zoom both loop indefinitely;
  // the shared PolarMotionToggle (rendered once in the root layout) is the
  // pause control spec section 9 requires for autoplay motion over 5s.
  const { paused } = usePolarMotion();

  return (
    <section className="relative flex h-svh min-h-[36rem] items-center justify-center overflow-hidden bg-black">
      {/* The animated sky sits behind everything and shows through the
          photo's soft top/bottom edges. */}
      <div className="absolute inset-0 overflow-hidden">
        <PolarAuroraScene
          paused={paused}
          reducedMotion={reducedMotion}
          className="hero-intro-image absolute inset-0 size-full"
        />
      </div>

      <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_26%,black_66%,transparent)]">
        <div
          className={`hero-intro-image absolute inset-0 ${reducedMotion ? "" : "hero-kenburns"}`}
          style={{ animationPlayState: paused ? "paused" : undefined }}
        >
          <Image
            src={credit.file}
            alt=""
            fill
            priority
            className="object-cover opacity-70"
            sizes="100vw"
          />
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10"
      />

      <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white">
        <Badge
          variant="secondary"
          className="hero-intro-item mb-6 bg-white/10 text-white backdrop-blur"
          style={{ "--intro-delay": "150ms" } as CSSProperties}
        >
          {heroCopy.eyebrow}
        </Badge>
        <h1
          className="hero-intro-item text-balance text-5xl font-extrabold tracking-tight sm:text-7xl"
          style={{ "--intro-delay": "280ms" } as CSSProperties}
        >
          {heroCopy.headline}
        </h1>
        <p
          className="hero-intro-item mx-auto mt-5 max-w-2xl text-pretty text-xl text-white/80"
          style={{ "--intro-delay": "420ms" } as CSSProperties}
        >
          {heroCopy.subheadline}
        </p>
        <div
          className="hero-intro-item mt-8 flex items-center justify-center gap-3"
          style={{ "--intro-delay": "560ms" } as CSSProperties}
        >
          <Button size="lg" asChild>
            <Link href="/archive">Explore the Archive</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link href="/signin">Researcher Sign In</Link>
          </Button>
        </div>
      </div>

      <a
        href="#programs"
        aria-label="Scroll to the research programs"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 sm:flex flex-col items-center gap-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60 hover:text-white"
      >
        Scroll
        <ChevronDown className={`size-5 ${reducedMotion ? "" : "hero-scroll-cue"}`} aria-hidden />
      </a>

      <a
        href={credit.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-3 right-4 text-xs text-white/50 hover:text-white/80"
      >
        Photo: {credit.credit} ({credit.license})
      </a>

      <style>{`
        /* Sub-second intro: the scene fades up, then the copy rises in.
           Nothing is blocked while it plays. */
        @media (prefers-reduced-motion: no-preference) {
          .hero-intro-image.hero-kenburns {
            animation-name: hero-fade-in, hero-kenburns;
            animation-duration: 900ms, 20s;
            animation-timing-function: ease-out, ease-in-out;
            animation-iteration-count: 1, infinite;
            animation-direction: normal, alternate;
          }
          .hero-intro-image:not(.hero-kenburns) {
            animation: hero-fade-in 900ms ease-out;
          }
          .hero-intro-item {
            animation: hero-rise 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
            animation-delay: var(--intro-delay, 0ms);
          }
        }
        @keyframes hero-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes hero-rise {
          from { opacity: 0; transform: translate3d(0, 1rem, 0); }
          to { opacity: 1; transform: none; }
        }
        @keyframes hero-kenburns {
          0% { transform: scale(1); }
          100% { transform: scale(1.12); }
        }
        @keyframes hero-scroll-cue {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50% { transform: translateY(12px); opacity: 1; }
        }
        .hero-scroll-cue {
          animation: hero-scroll-cue 1.6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
