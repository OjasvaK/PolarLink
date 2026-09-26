import type { Metadata } from "next";
import { PublicHeader } from "@/components/archive/public-header";
import { SiteFooter } from "@/components/site-footer";
import { StationMap } from "@/components/archive/station-map";

export const metadata: Metadata = {
  title: "Research Stations | PolarLink",
  description: "India’s research stations in Antarctica, the Arctic and the Himalaya.",
};

// Station expedition counts come from the database.
export const revalidate = 300;

export default function StationsPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full flex-1 max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">Research Stations</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          India’s stations in Antarctica, the Arctic and the Himalaya.
          Select a station to see its expeditions in the archive.
        </p>
        <div className="mt-10">
          <StationMap />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
