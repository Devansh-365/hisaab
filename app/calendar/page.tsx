"use client";

import { useMemo } from "react";
import { useMatchedTrades } from "@/hooks/use-trades";
import { CalendarHeatmap } from "@/components/calendar/heatmap";
import { StrategyBreakdownTable } from "@/components/journal/strategy-breakdown";
import { computeDailyPnl } from "@/lib/analytics/journal";
import { computeStrategyBreakdown } from "@/lib/analytics/journal";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CalendarPage() {
  const allTrades = useMatchedTrades();

  const dailyData = useMemo(
    () => computeDailyPnl(allTrades),
    [allTrades]
  );

  const strategyData = useMemo(
    () => computeStrategyBreakdown(allTrades),
    [allTrades]
  );

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80">
            Hisaab
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">Calendar</h1>
        </div>
        <div className="flex items-center gap-2" />
      </div>

      <CalendarHeatmap dailyData={dailyData} />

      <StrategyBreakdownTable data={strategyData} />
    </div>
  );
}
