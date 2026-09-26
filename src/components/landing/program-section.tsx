import type { ReactNode } from "react";
import { Reveal } from "./reveal";

type ProgramSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ProgramSection({
  eyebrow,
  title,
  description,
  children,
}: ProgramSectionProps) {
  return (
    <section className="overflow-x-clip bg-black py-20 text-white sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            {eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            {title}
          </h2>
        </Reveal>
        <Reveal>
          <p className="mt-4 max-w-xl text-pretty text-lg text-white/75">
            {description}
          </p>
        </Reveal>
        <div className="mt-14 sm:mt-20">{children}</div>
      </div>
    </section>
  );
}
