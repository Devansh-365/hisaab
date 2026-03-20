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
import { Button } from "@/components/ui/button";
import { Upload, Home } from "lucide-react";
import Link from "next/link";

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
      <div className="flex flex-col flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl space-y-6 text-center">
          <h1 className="text-2xl font-bold">No trades yet</h1>
          <p className="text-muted-foreground">
            Upload your broker tradebook to get started.
          </p>
          <DropZone />
          <Button variant="outline" render={<Link href="/" />}>
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-primary hover:opacity-80">
            Hisaab
          </Link>
          <select
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
            className="h-7 rounded-md border border-input bg-background px-2.5 text-xs font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="">All Time</option>
            {fys.map((fy) => (
              <option key={fy} value={fy}>
                {fy}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowUpload(!showUpload)}
        >
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
      </div>

      {/* Upload area (toggleable) */}
      {showUpload && (
        <DropZone onComplete={() => setShowUpload(false)} />
      )}

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
