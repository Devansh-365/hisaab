"use client";

import { useRouter } from "next/navigation";
import { DropZone } from "@/components/upload/drop-zone";
import { Button } from "@/components/ui/button";
import { useTradeCount } from "@/hooks/use-trades";
import { BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const tradeCount = useTradeCount();

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Hisaab
          </h1>
          <p className="text-xl text-muted-foreground">
            See your real win rate in 2 minutes
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
          <span>100% browser-based</span>
          <span>No data leaves your device</span>
          <span>Open source (MIT)</span>
        </div>
      </div>
    </div>
  );
}
