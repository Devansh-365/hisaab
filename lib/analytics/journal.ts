import type {
  MatchedTradeRecord,
  StrategyBreakdown,
  DailyPnl,
  JournalingStreak,
} from "@/lib/types";

export function computeStrategyBreakdown(
  trades: MatchedTradeRecord[]
): StrategyBreakdown[] {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const byTag = new Map<string, MatchedTradeRecord[]>();

  for (const trade of closed) {
    if (trade.tags && trade.tags.length > 0) {
      for (const tag of trade.tags) {
        const existing = byTag.get(tag) ?? [];
        existing.push(trade);
        byTag.set(tag, existing);
      }
    } else {
      const existing = byTag.get("untagged") ?? [];
      existing.push(trade);
      byTag.set("untagged", existing);
    }
  }

  const results: StrategyBreakdown[] = [];

  for (const [tag, tagTrades] of byTag) {
    const wins = tagTrades.filter((t) => t.pnl > 0);
    const losses = tagTrades.filter((t) => t.pnl < 0);
    const totalPnl = tagTrades.reduce((sum, t) => sum + t.pnl, 0);

    results.push({
      tag,
      trades: tagTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate:
        tagTrades.length > 0
          ? (wins.length / tagTrades.length) * 100
          : 0,
      pnl: totalPnl,
      avgPnl: tagTrades.length > 0 ? totalPnl / tagTrades.length : 0,
    });
  }

  return results.sort((a, b) => b.pnl - a.pnl);
}

export function computeDailyPnl(trades: MatchedTradeRecord[]): DailyPnl[] {
  const closed = trades.filter((t) => t.status === "CLOSED");
  const byDay = new Map<
    string,
    { pnl: number; trades: number; isAnnotated: boolean }
  >();

  for (const trade of closed) {
    const date = trade.exitDate.slice(0, 10); // "2025-04-15"
    const existing = byDay.get(date) ?? {
      pnl: 0,
      trades: 0,
      isAnnotated: false,
    };

    existing.pnl += trade.pnl;
    existing.trades += 1;
    if (trade.notes || (trade.tags && trade.tags.length > 0) || trade.rating) {
      existing.isAnnotated = true;
    }

    byDay.set(date, existing);
  }

  return Array.from(byDay.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeJournalingStreak(
  trades: MatchedTradeRecord[]
): JournalingStreak {
  const dailyData = computeDailyPnl(trades);
  const annotatedDates = dailyData
    .filter((d) => d.isAnnotated)
    .map((d) => d.date)
    .sort()
    .reverse();

  if (annotatedDates.length === 0) {
    return { current: 0, longest: 0, lastAnnotatedDate: null };
  }

  // Compute longest streak of consecutive annotated trading days
  const sortedAsc = [...annotatedDates].reverse();
  let longest = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      longest = Math.max(longest, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Compute current streak (from most recent)
  let current = 1;
  for (let i = 0; i < annotatedDates.length - 1; i++) {
    const curr = new Date(annotatedDates[i]);
    const next = new Date(annotatedDates[i + 1]);
    const diffDays = Math.round(
      (curr.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      current++;
    } else {
      break;
    }
  }

  return {
    current,
    longest: Math.max(longest, current),
    lastAnnotatedDate: annotatedDates[0],
  };
}
