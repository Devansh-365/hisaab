"use client";

import { useMemo, useState } from "react";
import { useMatchedTrades } from "@/hooks/use-trades";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { PnlCurve } from "@/components/dashboard/pnl-curve";
import { MonthlyBars } from "@/components/dashboard/monthly-bars";
import { TradeTable } from "@/components/dashboard/trade-table";
import { OpenPositions } from "@/components/dashboard/open-positions";
import { DropZone } from "@/components/upload/drop-zone";
import {
  computeKPIs,
  computeMonthlyPnl,
  computeCumulativePnl,
} from "@/lib/analytics/basic";
import { computeJournalingStreak } from "@/lib/analytics/journal";
import { useAnnotationStats } from "@/hooks/use-trades";
import { StreakWidget } from "@/components/journal/streak-widget";
import { getAllFYs, getCurrentFY } from "@/lib/utils/fy";
import { PageHeader } from "@/components/layout/page-header";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Home, BarChart3 } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/layout/empty-state";

export default function DashboardPage() {
  const allTrades = useMatchedTrades();
  const fys = useMemo(() => getAllFYs(allTrades), [allTrades]);
  const [selectedFY, setSelectedFY] = useState<string>("");
  const [showUpload, setShowUpload] = useState(false);

  const activeFY = selectedFY || (fys.length > 0 ? fys[0] : getCurrentFY());

  const filteredTrades = useMemo(
    () =>
      selectedFY
        ? allTrades.filter((t) => t.financialYear === selectedFY)
        : allTrades,
    [allTrades, selectedFY]
  );

  const kpis = useMemo(() => computeKPIs(filteredTrades), [filteredTrades]);
  const monthlyData = useMemo(
    () => computeMonthlyPnl(filteredTrades),
    [filteredTrades]
  );
  const cumulativeData = useMemo(
    () => computeCumulativePnl(filteredTrades),
    [filteredTrades]
  );
  const streak = useMemo(
    () => computeJournalingStreak(filteredTrades),
    [filteredTrades]
  );
  const annotationStats = useAnnotationStats();

  if (allTrades.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No trades yet"
        description="Upload your broker tradebook to see your P&L dashboard, win rate, and performance charts."
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader title="Dashboard">
        <select
          value={selectedFY}
          onChange={(e) => setSelectedFY(e.target.value)}
          className="h-7 rounded-md border border-input bg-transparent px-2.5 text-xs font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <option value="">All Time</option>
          {fys.map((fy) => (
            <option key={fy} value={fy}>
              {fy}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUpload(true)}
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
      </PageHeader>

      {/* Import dialog (bottom sheet on mobile) */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Trades</DialogTitle>
            <DialogDescription>
              Upload your broker tradebook CSV or XLSX file.
            </DialogDescription>
          </DialogHeader>
          <DropZone onComplete={() => setShowUpload(false)} />
        </DialogContent>
      </Dialog>

      {/* KPIs + Streak */}
      <KPICards kpis={kpis} />
      {annotationStats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StreakWidget
            streak={streak}
            unreviewed={annotationStats.unreviewed}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PnlCurve data={cumulativeData} />
        <MonthlyBars data={monthlyData} />
      </div>

      {/* Trade Table */}
      <TradeTable trades={filteredTrades} />

      {/* Open Positions */}
      <OpenPositions trades={filteredTrades} />
    </div>
  );
}
