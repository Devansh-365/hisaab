"use client";

import { useMemo } from "react";
import { useMatchedTradesWithLoading } from "@/hooks/use-trades";
import { CalendarHeatmap } from "@/components/calendar/heatmap";
import { StrategyBreakdownTable } from "@/components/journal/strategy-breakdown";
import { computeDailyPnl } from "@/lib/analytics/journal";
import { computeStrategyBreakdown } from "@/lib/analytics/journal";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { PageLoading } from "@/components/layout/page-loading";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  const { data: allTrades, isLoading } = useMatchedTradesWithLoading();

  const dailyData = useMemo(
    () => computeDailyPnl(allTrades),
    [allTrades]
  );

  const strategyData = useMemo(
    () => computeStrategyBreakdown(allTrades),
    [allTrades]
  );

  if (isLoading) return <PageLoading />;

  if (allTrades.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No calendar data yet"
        description="Upload your trades to see a daily P&L heatmap across the financial year."
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader title="Calendar" />

      <CalendarHeatmap dailyData={dailyData} />

      <StrategyBreakdownTable data={strategyData} />
    </div>
  );
}
