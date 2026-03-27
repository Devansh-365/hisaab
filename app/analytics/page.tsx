"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useMatchedTradesWithLoading } from "@/hooks/use-trades";
import { PageHeader } from "@/components/layout/page-header";
import { AdvancedMetricsCard } from "@/components/analytics/advanced-metrics";
import { DrawdownChart } from "@/components/analytics/drawdown-chart";
import { DayOfWeekChart } from "@/components/analytics/day-of-week";
import { HoldingAnalysis } from "@/components/analytics/holding-analysis";
import { TiltCard } from "@/components/analytics/tilt-card";
import { TaxReport } from "@/components/analytics/tax-report";
import { Button } from "@/components/ui/button";
import {
  computeAdvancedMetrics,
  computeDrawdownCurve,
  runMonteCarlo,
} from "@/lib/analytics/advanced";
import {
  computeDayOfWeekPerformance,
  computeHoldingPeriodAnalysis,
  computeTiltAnalysis,
} from "@/lib/analytics/behavioral";
import {
  exportMatchedTradesCSV,
  exportAllDataJSON,
  downloadFile,
} from "@/lib/utils/export";
import { Download, FileJson, FileSpreadsheet, Activity, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetisAnalyticsCTA } from "@/components/metis/cta-banner";
import { EmptyState } from "@/components/layout/empty-state";
import { PageLoading } from "@/components/layout/page-loading";

export default function AnalyticsPage() {
  const { data: allTrades, isLoading } = useMatchedTradesWithLoading();
  const [monteCarloResult, setMonteCarloResult] = useState<ReturnType<
    typeof runMonteCarlo
  > | null>(null);
  const [mcLoading, setMcLoading] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  const advancedMetrics = useMemo(
    () => computeAdvancedMetrics(allTrades),
    [allTrades]
  );
  const drawdownData = useMemo(
    () => computeDrawdownCurve(allTrades),
    [allTrades]
  );
  const dayOfWeek = useMemo(
    () => computeDayOfWeekPerformance(allTrades),
    [allTrades]
  );
  const holdingPeriod = useMemo(
    () => computeHoldingPeriodAnalysis(allTrades),
    [allTrades]
  );
  const tilt = useMemo(
    () => computeTiltAnalysis(allTrades),
    [allTrades]
  );

  function handleMonteCarlo() {
    setMcLoading(true);
    setTimeout(() => {
      const result = runMonteCarlo(allTrades);
      if (mountedRef.current) {
        setMonteCarloResult(result);
        setMcLoading(false);
      }
    }, 50);
  }

  async function handleExportCSV() {
    const csv = await exportMatchedTradesCSV();
    downloadFile(csv, `hisaab-trades-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  }

  async function handleExportJSON() {
    const json = await exportAllDataJSON();
    downloadFile(json, `hisaab-backup-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
  }

  if (isLoading) return <PageLoading />;

  if (allTrades.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No analytics yet"
        description="Upload your trades to see Sharpe ratio, drawdown, Monte Carlo simulation, and behavioral patterns."
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader title="Analytics">
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-1" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJSON}>
          <FileJson className="h-4 w-4 mr-1" />
          JSON
        </Button>
      </PageHeader>

      {/* Advanced KPIs */}
      <AdvancedMetricsCard metrics={advancedMetrics} />

      {/* Equity + Drawdown */}
      <DrawdownChart data={drawdownData} />

      {/* Behavioral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DayOfWeekChart data={dayOfWeek} />
        <TiltCard data={tilt} />
      </div>

      <HoldingAnalysis data={holdingPeriod} />

      {/* Tax Report */}
      <TaxReport trades={allTrades} />

      {/* Monte Carlo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Monte Carlo Simulation
            </CardTitle>
            <Button
              size="sm"
              onClick={handleMonteCarlo}
              disabled={mcLoading || allTrades.length === 0}
            >
              {mcLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Running...
                </>
              ) : (
                "Run 1,000 Simulations"
              )}
            </Button>
          </div>
        </CardHeader>
        {mcLoading && (
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        )}
        {monteCarloResult && (
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Results from 1,000 random resampling simulations of your trade history.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">5th Percentile (worst)</p>
                <p className={`text-sm font-semibold ${monteCarloResult.percentile5 >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatINR(monteCarloResult.percentile5)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Median (50th)</p>
                <p className={`text-sm font-semibold ${monteCarloResult.median >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatINR(monteCarloResult.median)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">95th Percentile (best)</p>
                <p className={`text-sm font-semibold ${monteCarloResult.percentile95 >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatINR(monteCarloResult.percentile95)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">25th Percentile</p>
                <p className="text-sm font-semibold">
                  {formatINR(monteCarloResult.percentile25)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">75th Percentile</p>
                <p className="text-sm font-semibold">
                  {formatINR(monteCarloResult.percentile75)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ruin Probability</p>
                <p className={`text-sm font-semibold ${monteCarloResult.ruinProbability > 10 ? "text-red-600" : "text-green-600"}`}>
                  {monteCarloResult.ruinProbability.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Metis CTA */}
      <MetisAnalyticsCTA />
    </div>
  );
}
