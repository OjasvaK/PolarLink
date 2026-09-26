import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold tracking-tight text-white">PolarLink</span>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <Link href="/archive" className="hover:text-white">Archive</Link>
          <Link href="/archive?type=dataset" className="hover:text-white">Datasets</Link>
          <Link href="/archive?type=publication" className="hover:text-white">Publications</Link>
          <Link href="/archive?type=media" className="hover:text-white">Media</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link href="/signin">Researcher Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
