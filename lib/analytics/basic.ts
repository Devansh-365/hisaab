import type {
  MatchedTradeRecord,
  DashboardKPIs,
  MonthlyPnl,
  CumulativePnlPoint,
} from "@/lib/types";

export function computeKPIs(trades: MatchedTradeRecord[]): DashboardKPIs {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const winners = closed.filter((t) => t.pnl > 0);
  const losers = closed.filter((t) => t.pnl < 0);

  const grossProfit = winners.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.pnl, 0));

  const sortedByPnl = [...closed].sort((a, b) => b.pnl - a.pnl);

  return {
    netPnl: grossProfit - grossLoss,
    totalTrades: closed.length,
    winners: winners.length,
    losers: losers.length,
    winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
    profitFactor:
      grossLoss > 0
        ? grossProfit / grossLoss
        : grossProfit > 0
          ? Infinity
          : 0,
    avgWin: winners.length > 0 ? grossProfit / winners.length : 0,
    avgLoss: losers.length > 0 ? grossLoss / losers.length : 0,
    bestTrade: sortedByPnl[0] ?? null,
    worstTrade: sortedByPnl[sortedByPnl.length - 1] ?? null,
    avgHoldingDays:
      closed.length > 0
        ? closed.reduce((sum, t) => sum + t.holdingDays, 0) / closed.length
        : 0,
    openPositions: trades.filter((t) => t.status === "OPEN").length,
  };
}

export function computeMonthlyPnl(trades: MatchedTradeRecord[]): MonthlyPnl[] {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const byMonth = new Map<string, MonthlyPnl>();

  for (const trade of closed) {
    const month = trade.exitDate.slice(0, 7); // "2025-04"
    const existing = byMonth.get(month) ?? {
      month,
      pnl: 0,
      trades: 0,
      wins: 0,
      losses: 0,
    };

    existing.pnl += trade.pnl;
    existing.trades += 1;
    if (trade.pnl > 0) existing.wins += 1;
    if (trade.pnl < 0) existing.losses += 1;

    byMonth.set(month, existing);
  }

  return Array.from(byMonth.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );
}

export function computeCumulativePnl(
  trades: MatchedTradeRecord[]
): CumulativePnlPoint[] {
  const closed = trades
    .filter((t) => t.status === "CLOSED")
    .sort((a, b) => a.exitDate.localeCompare(b.exitDate));

  let cumulative = 0;
  return closed.map((t) => {
    cumulative += t.pnl;
    return {
      date: t.exitDate,
      pnl: t.pnl,
      cumulative,
    };
  });
}

export function computePnlDistribution(
  trades: MatchedTradeRecord[]
): { range: string; count: number }[] {
  const closed = trades.filter((t) => t.status === "CLOSED");
  if (closed.length === 0) return [];

  const pnls = closed.map((t) => t.pnl);
  const max = Math.max(...pnls.map(Math.abs));
  const bucketSize = max > 0 ? Math.ceil(max / 5 / 1000) * 1000 : 1000;

  const buckets = new Map<number, number>();

  for (const pnl of pnls) {
    const bucket = Math.floor(pnl / bucketSize) * bucketSize;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, count]) => ({
      range: `${bucket >= 0 ? "+" : ""}${(bucket / 1000).toFixed(0)}K`,
      count,
    }));
}
