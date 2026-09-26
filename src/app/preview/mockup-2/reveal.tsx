"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const reducedMotion = usePrefersReducedMotion();
  const visible = reducedMotion || inView;

  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
