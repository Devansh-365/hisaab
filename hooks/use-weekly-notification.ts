"use client";

import { useEffect, useRef } from "react";
import type { MatchedTradeRecord } from "@/lib/types";
import { showWeeklyPnlNotification } from "@/lib/notifications";

/**
 * Computes the last 7 days' P&L from closed trades and shows a weekly
 * notification if permission is granted and a week has passed.
 */
export function useWeeklyNotification(trades: MatchedTradeRecord[]) {
  const ran = useRef(false);

  useEffect(() => {
    // Run only once per session
    if (ran.current) return;
    if (trades.length === 0) return;
    ran.current = true;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentClosed = trades.filter(
      (t) =>
        t.status === "CLOSED" &&
        new Date(t.exitDate) >= weekAgo
    );

    if (recentClosed.length === 0) return;

    const winners = recentClosed.filter((t) => t.pnl > 0).length;
    const losers = recentClosed.filter((t) => t.pnl <= 0).length;
    const netPnl = recentClosed.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = recentClosed.length > 0
      ? (winners / recentClosed.length) * 100
      : 0;

    showWeeklyPnlNotification({ winners, losers, netPnl, winRate });
  }, [trades]);
}
