import Link from "next/link";

const directions = [
  {
    href: "/preview/mockup-1",
    title: "Direction 1 — Watermelon-inspired (hand-rebuilt)",
    description:
      "Calm, structured layout with a CSS-driven route diagram. No Watermelon UI blocks installed as-is — see spec section 14a for why.",
  },
  {
    href: "/preview/mockup-2",
    title: "Direction 2 — Skiper UI-flavored",
    description:
      "Uses Skiper UI's Progressive Blur component plus scroll-reveal motion for a slightly bolder hero treatment.",
  },
  {
    href: "/preview/mockup-3",
    title: "Direction 3 — anime.js hand-built",
    description:
      "Hero entrance and the station route diagram are both driven by anime.js timelines, hand-built with no third-party UI kit.",
  },
  {
    href: "/preview/mockup-4",
    title: "Direction 4 — cinematic documentary",
    description:
      "Full-bleed real photography (aurora over Ny-Alesund, CC BY 2.0) with a slow Ken Burns zoom and scroll parallax, inspired by marsrejects.com's mechanic but restyled for an institutional tone.",
  },
];

export default function PreviewIndex() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Landing page direction mockups</h1>
      <p className="mt-2 text-muted-foreground">
        Build plan step 2 (spec section 12). Pick one direction, or a merge of elements,
        before any further page gets built.
      </p>
      <ul className="mt-8 space-y-4">
        {directions.map((direction) => (
          <li key={direction.href} className="rounded-lg border p-4">
            <Link href={direction.href} className="font-medium underline-offset-4 hover:underline">
              {direction.title}
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">{direction.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
