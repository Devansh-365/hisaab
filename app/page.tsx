"use client";

import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/drop-zone";
import { Button } from "@/components/ui/button";
import { useTradeCount } from "@/hooks/use-trades";
import { ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { BrokerStrip } from "@/components/brokers/broker-logos";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function Home() {
  const router = useRouter();
  const tradeCount = useTradeCount();

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <MarketingHeader />

      {/* ── Hero ── */}
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-16 text-center md:px-10 md:pt-20 md:pb-24">
        <div className="animate-fade-up">
          <div className="mb-7 inline-flex items-center gap-2.5">
            <span className="inline-block size-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-light tracking-[0.15em] uppercase text-muted-foreground">
              Open-source trading journal
            </span>
          </div>
        </div>

        <div className="animate-fade-up delay-1">
          <h1 className="mx-auto max-w-4xl font-[family-name:var(--font-serif)] text-[clamp(36px,6.5vw,72px)] font-light leading-[0.95] tracking-[-0.03em]">
            Your real win rate.
            <br />
            <span className="text-muted-foreground">
              Revealed in 2 minutes.
            </span>
          </h1>
        </div>

        <div className="animate-fade-up delay-2">
          <p className="mx-auto mt-7 max-w-md text-[15px] font-light leading-[1.7] text-muted-foreground">
            Upload your broker CSV. Get P&L analytics, behavioral patterns,
            and tax reports in seconds. No signup. Your data never leaves
            your browser.
          </p>
        </div>

        <div className="animate-fade-up delay-3">
          <div className="mx-auto mt-9 flex max-w-sm items-center justify-center gap-4">
            <Button
              className="h-10 px-5 text-[13px] font-normal"
              onClick={() => document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" })}
            >
              Upload Tradebook
            </Button>
            <Link
              href="/demo"
              className="text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground inline-flex items-center gap-1"
            >
              Try demo
              <ArrowRight className="size-3" />
            </Link>
          </div>

          {tradeCount > 0 && (
            <Link href="/dashboard" className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-primary hover:underline">
              <BarChart3 className="size-3.5" />
              Open dashboard ({tradeCount} trades)
            </Link>
          )}
        </div>
      </section>

      {/* ── Product Demo ── */}
      <section className="mx-auto max-w-5xl px-6 pb-28 md:px-10 md:pb-36">
        <div className="animate-fade-up delay-4">
          <div className="mx-auto max-w-2xl">
            <DashboardPreview />
          </div>
          <div className="mt-8 text-center">
            <BrokerStrip />
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="h-px bg-border/40" />
      </div>

      {/* ── Value Props ── */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:px-10 md:py-32">
        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {[
            {
              title: "5 seconds to insight",
              body: "Drop your Zerodha, Groww, Upstox, or Angel One tradebook. Broker detected automatically. Win rate, P&L curve, and profit factor -- instantly.",
            },
            {
              title: "Patterns you can't see",
              body: "Sharpe ratio. Monte Carlo simulation. Day-of-week analysis. Holding period tilt. The behavioral patterns hiding in your trade history.",
            },
            {
              title: "Private by architecture",
              body: "Static site. IndexedDB. Zero network requests with your data. No server, no database, no tracking. Open source -- read every line.",
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h3 className="text-[15px] font-medium tracking-tight">{title}</h3>
              <p className="mt-2.5 text-[13px] font-light leading-[1.7] text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className="h-px bg-border/40" />
      </div>

      {/* ── Final CTA ── */}
      <section id="upload" className="mx-auto max-w-5xl px-6 py-28 text-center md:px-10 md:py-36">
        <h2 className="mx-auto max-w-2xl font-[family-name:var(--font-serif)] text-[clamp(28px,4vw,52px)] font-light leading-[1.1] tracking-[-0.02em]">
          See your real edge.
          <br />
          <span className="text-muted-foreground">
            Drop your tradebook below.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-sm text-[14px] font-light leading-[1.7] text-muted-foreground">
          No signup. No server. Free forever.
        </p>

        <div className="mx-auto mt-10 max-w-lg">
          <DropZone onComplete={() => router.push("/dashboard")} />
        </div>

        <Link
          href="/demo"
          className="mt-6 inline-flex items-center gap-1 text-[13px] font-light text-muted-foreground transition-colors hover:text-foreground"
        >
          or try with sample data
          <ArrowRight className="size-3" />
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
