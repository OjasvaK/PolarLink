"use client";

import type { ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";

// Sets data-inview="true" once its content scrolls into view, so CSS can
// start one-shot entrance animations without shipping the content itself
// to the client.
export function InView({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  return (
    <div ref={ref} data-inview={inView} className={className}>
      {children}
    </div>
  );
}
