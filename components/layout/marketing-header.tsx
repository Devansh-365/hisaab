"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_REPO } from "@/lib/constants";

interface MarketingHeaderProps {
  links?: { href: string; label: string; external?: boolean }[];
}

const DEFAULT_LINKS = [
  { href: "/demo", label: "Demo" },
  { href: SITE_REPO, label: "GitHub", external: true },
];

export function MarketingHeader({ links = DEFAULT_LINKS }: MarketingHeaderProps) {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-10 md:py-6">
      <Link href="/" className="transition-opacity hover:opacity-70">
        <Logo />
      </Link>
      <nav className="flex items-center gap-1">
        {links.map(({ href, label, external }) =>
          external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-[12px] font-light tracking-wide text-muted-foreground transition-colors hover:text-foreground hidden sm:block"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-[12px] font-light tracking-wide text-muted-foreground transition-colors hover:text-foreground hidden sm:block"
            >
              {label}
            </Link>
          )
        )}
        <div className="ml-1">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
