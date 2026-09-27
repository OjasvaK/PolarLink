"use client";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { usePolarMotion } from "@/components/landing/polar-motion-context";
import { PolarGlacierScene } from "@/components/landing/polar-glacier-scene";

/**
 * Reads prefers-reduced-motion and the shared pause state itself, so
 * server-component pages can drop the glacier scene into a dark section
 * without becoming client components.
 */
export function PolarGlacierAccent({ className }: { className?: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const { paused } = usePolarMotion();
  return <PolarGlacierScene paused={paused} reducedMotion={reducedMotion} className={className} />;
}
