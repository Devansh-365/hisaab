import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MetisTrustSignal } from "@/components/metis/cta-banner";
import { SITE_REPO } from "@/lib/constants";

const productLinks = [
  { href: "/demo", label: "Demo" },
  { href: "/privacy", label: "Privacy" },
  { href: "/feed.xml", label: "RSS Feed" },
] as const;

const ossLinks = [
  { href: SITE_REPO, label: "GitHub" },
  { href: `${SITE_REPO}/blob/main/CONTRIBUTING.md`, label: "Contributing" },
  { href: `${SITE_REPO}/issues`, label: "Issues" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/30">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <Logo />
            <p className="mt-2 text-[11px] font-light leading-relaxed text-muted-foreground/70">
              Open-source trading journal for Indian traders. Upload your broker
              CSV, see your real win rate. Free forever.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground/50">
                Product
              </span>
              <div className="mt-2 flex flex-col gap-1.5">
                {productLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-[11px] font-light text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-normal uppercase tracking-wider text-muted-foreground/50">
                Open Source
              </span>
              <div className="mt-2 flex flex-col gap-1.5">
                {ossLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-light text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border-t border-border/20 pt-4">
          <MetisTrustSignal />
        </div>
      </div>
    </footer>
  );
}
