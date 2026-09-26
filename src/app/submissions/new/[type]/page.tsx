import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { ContentForm } from "@/components/content/content-form";
import { hasRole, requireRole } from "@/lib/auth-guard";
import { publishedExpeditionOptions } from "@/lib/content/repo";
import { contentTypes, isContentSlug } from "@/lib/content/types";
import { saveSubmission } from "../../actions";

export const metadata: Metadata = {
  title: "New submission | PolarLink",
};

export default async function NewSubmissionPage({ params }: PageProps<"/submissions/new/[type]">) {
  const { type: slug } = await params;
  if (!isContentSlug(slug)) notFound();
  const type = contentTypes[slug];

  const user = await requireRole("RESEARCHER", `/submissions/new/${slug}`);
  if (!hasRole(user.role, type.minRole)) redirect("/dashboard?denied=1");

  const expeditions = await publishedExpeditionOptions();

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <Link href="/submissions" className="text-sm text-muted-foreground hover:text-foreground">
          Back to My Submissions
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">New {type.label.toLowerCase()}</h1>
        <div className="mt-8">
          <ContentForm slug={slug} action={saveSubmission.bind(null, slug, null)} expeditions={expeditions} />
        </div>
      </main>
    </div>
  );
}
