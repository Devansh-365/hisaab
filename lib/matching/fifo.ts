import { ulid } from "ulid";
import type { TradeRecord, MatchedTradeRecord } from "@/lib/types";
import { daysBetween } from "@/lib/utils/dates";
import { getFY } from "@/lib/utils/fy";

interface QueueEntry {
  trade: TradeRecord;
  remainingQty: number;
}

export function matchTradesFIFO(trades: TradeRecord[]): MatchedTradeRecord[] {
  const bySymbol = new Map<string, TradeRecord[]>();
  for (const trade of trades) {
    const existing = bySymbol.get(trade.symbol) ?? [];
    existing.push(trade);
    bySymbol.set(trade.symbol, existing);
  }

  const matched: MatchedTradeRecord[] = [];

  for (const [symbol, symbolTrades] of bySymbol) {
    const sorted = [...symbolTrades].sort((a, b) =>
      a.tradeDate.localeCompare(b.tradeDate)
    );

    const buyQueue: QueueEntry[] = [];
    const sellQueue: QueueEntry[] = [];

    for (const trade of sorted) {
      let remainingQty = trade.quantity;

      if (trade.tradeType === "BUY") {
        // Try to close short positions first (FIFO)
        remainingQty = matchAgainstQueue(
          sellQueue, trade, remainingQty, "SHORT", symbol, matched
        );
        // Leftover goes to buy queue (opens new long)
        if (remainingQty > 0) {
          buyQueue.push({ trade, remainingQty });
        }
      } else {
        // SELL: close long positions first (FIFO)
        remainingQty = matchAgainstQueue(
          buyQueue, trade, remainingQty, "LONG", symbol, matched
        );
        // Leftover goes to sell queue (opens new short)
        if (remainingQty > 0) {
          sellQueue.push({ trade, remainingQty });
        }
      }
    }

    // Remaining in queues = open positions
    for (const entry of buyQueue) {
      if (entry.remainingQty > 0) {
        matched.push(createOpenPosition(entry, symbol, "LONG"));
      }
    }
    for (const entry of sellQueue) {
      if (entry.remainingQty > 0) {
        matched.push(createOpenPosition(entry, symbol, "SHORT"));
      }
    }
  }

  return matched.sort((a, b) => a.entryDate.localeCompare(b.entryDate));
}

/**
 * Match incoming trade against a queue. Returns the remaining unmatched quantity.
 */
function matchAgainstQueue(
  queue: QueueEntry[],
  incomingTrade: TradeRecord,
  incomingQty: number,
  direction: "LONG" | "SHORT",
  symbol: string,
  results: MatchedTradeRecord[]
): number {
  let remaining = incomingQty;

  while (remaining > 0 && queue.length > 0) {
    const front = queue[0];
    const matchQty = Math.min(front.remainingQty, remaining);

    const isLong = direction === "LONG";
    const entryTrade = isLong ? front.trade : incomingTrade;
    const exitTrade = isLong ? incomingTrade : front.trade;
    const entryPrice = isLong ? front.trade.price : incomingTrade.price;
    const exitPrice = isLong ? incomingTrade.price : front.trade.price;

    const pnl = isLong
      ? (exitPrice - entryPrice) * matchQty
      : (entryPrice - exitPrice) * matchQty;
    const pnlPercent =
      entryPrice !== 0
        ? ((isLong ? exitPrice - entryPrice : entryPrice - exitPrice) /
            entryPrice) *
          100
        : 0;

    const entryDate = isLong
      ? front.trade.tradeDate
      : incomingTrade.tradeDate;
    const exitDate = isLong
      ? incomingTrade.tradeDate
      : front.trade.tradeDate;

    results.push({
      id: ulid(),
      symbol,
      segment:
        entryTrade.segment === "FO" || exitTrade.segment === "FO"
          ? "FO"
          : entryTrade.segment === "CD" || exitTrade.segment === "CD"
            ? "FO" // treat CD as FO for matching purposes
            : "EQ",
      direction,
      entryDate,
      exitDate,
      entryPrice,
      exitPrice,
      quantity: matchQty,
      pnl,
      pnlPercent,
      holdingDays: daysBetween(entryDate, exitDate),
      status: "CLOSED",
      financialYear: getFY(exitDate),
      entryTradeIds: [entryTrade.id],
      exitTradeIds: [exitTrade.id],
    });

    front.remainingQty -= matchQty;
    remaining -= matchQty;

    if (front.remainingQty <= 0) {
      queue.shift();
    }
  }

  return remaining;
}

function createOpenPosition(
  entry: QueueEntry,
  symbol: string,
  direction: "LONG" | "SHORT"
): MatchedTradeRecord {
  return {
    id: ulid(),
    symbol,
    segment: entry.trade.segment === "FO" ? "FO" : "EQ",
    direction,
    entryDate: entry.trade.tradeDate,
    exitDate: entry.trade.tradeDate,
    entryPrice: entry.trade.price,
    exitPrice: 0,
    quantity: entry.remainingQty,
    pnl: 0,
    pnlPercent: 0,
    holdingDays: daysBetween(entry.trade.tradeDate, new Date().toISOString()),
    status: "OPEN",
    financialYear: getFY(entry.trade.tradeDate),
    entryTradeIds: [entry.trade.id],
    exitTradeIds: [],
  };
}
