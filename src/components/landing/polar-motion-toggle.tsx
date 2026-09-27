"use client";

import { Pause, Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { usePolarMotion } from "@/components/landing/polar-motion-context";

/**
 * Fixed on every page. Controls every polar scene at once (see
 * PolarMotionProvider). Hidden when the OS already prefers reduced motion,
 * since there is nothing running to pause.
 */
export function PolarMotionToggle() {
  const reducedMotion = usePrefersReducedMotion();
  const { paused, togglePaused } = usePolarMotion();

  if (reducedMotion) return null;

  return (
    <button
      type="button"
      onClick={togglePaused}
      aria-label={paused ? "Play background motion" : "Pause background motion"}
      aria-pressed={paused}
      className="fixed bottom-4 left-4 z-40 flex size-9 items-center justify-center rounded-full border border-foreground/15 bg-background/70 text-foreground/70 backdrop-blur-md transition-colors hover:bg-background/90 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
    </button>
  );
}
