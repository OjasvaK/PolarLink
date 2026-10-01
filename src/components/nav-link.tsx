"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Highlights the current section in a nav list. Compares both the path and
// (when the href carries one) the `type` query param, so archive filter
// links like `/archive?type=dataset` highlight correctly against each other.
export function NavLink({ href, className, children, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hrefString = href.toString();
  const [hrefPath, hrefQuery] = hrefString.split("?");
  const hrefType = new URLSearchParams(hrefQuery).get("type");
  const currentType = searchParams.get("type");

  const pathMatches = hrefPath === "/" ? pathname === "/" : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  const active = pathMatches && (pathname !== hrefPath || hrefType === currentType);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn("transition-colors", active ? "font-medium text-foreground" : "hover:text-foreground", className)}
      {...props}
    >
      {children}
    </Link>
  );
}
