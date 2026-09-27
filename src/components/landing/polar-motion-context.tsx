"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type PolarMotionContextValue = {
  paused: boolean;
  togglePaused: () => void;
};

const PolarMotionContext = createContext<PolarMotionContextValue | null>(null);

/**
 * One shared pause/play switch for every decorative polar scene on the site
 * (the global backdrop, the hero, and the dark-section accents), so a single
 * control satisfies "autoplay motion over 5 seconds needs a pause control"
 * (spec section 9) instead of one button per section.
 */
export function PolarMotionProvider({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  const value = useMemo(
    () => ({ paused, togglePaused: () => setPaused((p) => !p) }),
    [paused]
  );
  return <PolarMotionContext.Provider value={value}>{children}</PolarMotionContext.Provider>;
}

export function usePolarMotion() {
  const ctx = useContext(PolarMotionContext);
  if (!ctx) throw new Error("usePolarMotion must be used within a PolarMotionProvider");
  return ctx;
}
