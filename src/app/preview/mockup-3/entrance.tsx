"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export function Entrance({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;
    const targets = containerRef.current.querySelectorAll("[data-entrance]");
    const animation = animate(targets, {
      opacity: [0, 1],
      translateY: [16, 0],
      delay: stagger(120),
      duration: 600,
      ease: "outQuad",
    });
    return () => {
      animation.revert();
    };
  }, [reducedMotion]);

  return <div ref={containerRef}>{children}</div>;
}
