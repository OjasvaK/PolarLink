import type { ReactNode } from "react";
import { PublicHeader } from "@/components/archive/public-header";
import { SiteFooter } from "@/components/site-footer";

// Shared layout and typography for the static pages (spec section 8.7).

export const lastUpdated = "27 September 2026";

export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function ContactLine() {
  return contactEmail ? (
    <a href={`mailto:${contactEmail}`} className="underline underline-offset-4">
      {contactEmail}
    </a>
  ) : (
    <span>the contact address that will be published here before launch</span>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader />
      <main className="bg-background mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {lastUpdated}</p>
        {intro && <div className="mt-6 text-lg text-pretty text-muted-foreground">{intro}</div>}
        <div className="mt-10 grid gap-10">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-3 grid gap-3 leading-relaxed text-pretty [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5">
        {children}
      </div>
    </section>
  );
}
