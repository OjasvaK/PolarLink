"use client";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { usePolarMotion } from "@/components/landing/polar-motion-context";
import { PolarAuroraScene } from "@/components/landing/polar-aurora-scene";

/**
 * Mounted once in the root layout so it persists (and keeps animating)
 * across client-side navigation instead of restarting on every page. Uses
 * the same rich aurora + snow scene as the hero, so the whole site reads as
 * one continuous atmosphere rather than the hero being a special case.
 */
export function PolarBackdrop() {
  const reducedMotion = usePrefersReducedMotion();
  const { paused } = usePolarMotion();

  return (
    <PolarAuroraScene
      paused={paused}
      reducedMotion={reducedMotion}
      className="pointer-events-none fixed inset-0 -z-50 size-full"
    />
  );
}
