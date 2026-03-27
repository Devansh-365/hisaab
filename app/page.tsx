"use client";

import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/drop-zone";
import { Button } from "@/components/ui/button";
import { useTradeCount } from "@/hooks/use-trades";
import { BarChart3, ArrowRight, Shield, Globe, Github } from "lucide-react";
import Link from "next/link";
import { MetisTrustSignal } from "@/components/metis/cta-banner";
import { BrokerStrip } from "@/components/brokers/broker-logos";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const tradeCount = useTradeCount();

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-16 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Open source trading journal
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-primary">Hisaab</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            See your real win rate in <span className="text-primary font-semibold">2 minutes</span>
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Upload your broker tradebook. Get instant P&L analytics.
            Zero signup. Everything stays in your browser.
          </p>
        </div>

        {/* Drop Zone */}
        <DropZone onComplete={() => router.push("/dashboard")} />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {tradeCount > 0 && (
            <Button render={<Link href="/dashboard" />}>
              <BarChart3 className="h-4 w-4 mr-2" />
              View Dashboard ({tradeCount} trades)
            </Button>
          )}
          <Button variant="outline" render={<Link href="/demo" />}>
            Try Demo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <Link href="/privacy" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <Shield className="h-3 w-3 text-primary" />
            100% browser-based
          </Link>
          <Link href="/privacy" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <Globe className="h-3 w-3 text-primary" />
            No data leaves your device
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <Github className="h-3 w-3 text-primary" />
            Open source (MIT)
          </span>
        </div>

        {/* Supported brokers */}
        <BrokerStrip />

        {/* Metis ecosystem signal */}
        <MetisTrustSignal />
      </div>
    </div>
  );
}
