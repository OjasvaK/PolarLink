import Link from "next/link";

const links = [
  { href: "/about", label: "About This Project" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/api/public/feed.xml", label: "RSS Feed" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/75 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md">
          A prototype built for Smart India Hackathon 2026 (problem statement
          26063). Not an official website of NCPOR or the Government of India.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
