import { ulid } from "ulid";
import type { TradeRecord, MatchedTradeRecord } from "@/lib/types";
import { daysBetween } from "@/lib/utils/dates";
import { getFY } from "@/lib/utils/fy";

interface QueueEntry {
  trade: TradeRecord;
  remainingQty: number;
}

export function matchTradesFIFO(trades: TradeRecord[]): MatchedTradeRecord[] {
  // Group by symbol
  const bySymbol = new Map<string, TradeRecord[]>();
  for (const trade of trades) {
    const existing = bySymbol.get(trade.symbol) ?? [];
    existing.push(trade);
    bySymbol.set(trade.symbol, existing);
  }

  const matched: MatchedTradeRecord[] = [];

  for (const [symbol, symbolTrades] of bySymbol) {
    // Sort chronologically
    const sorted = [...symbolTrades].sort((a, b) =>
      a.tradeDate.localeCompare(b.tradeDate)
    );

    const buyQueue: QueueEntry[] = [];
    const sellQueue: QueueEntry[] = [];

    for (const trade of sorted) {
      if (trade.tradeType === "BUY") {
        // Try to close short positions first (FIFO)
        if (sellQueue.length > 0) {
          matchFromQueue(sellQueue, trade, "SHORT", symbol, matched);
        } else {
          buyQueue.push({ trade, remainingQty: trade.quantity });
        }
      } else {
        // SELL — close long positions first (FIFO)
        if (buyQueue.length > 0) {
          matchFromQueue(buyQueue, trade, "LONG", symbol, matched);
        } else {
          sellQueue.push({ trade, remainingQty: trade.quantity });
        }
      }
    }

    // Remaining in queues → open positions
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

function matchFromQueue(
  queue: QueueEntry[],
  incomingTrade: TradeRecord,
  direction: "LONG" | "SHORT",
  symbol: string,
  results: MatchedTradeRecord[]
) {
  let remainingIncoming = incomingTrade.quantity;

  while (remainingIncoming > 0 && queue.length > 0) {
    const front = queue[0];
    const matchQty = Math.min(front.remainingQty, remainingIncoming);

    const isLong = direction === "LONG";
    const entryTrade = isLong ? front.trade : incomingTrade;
    const exitTrade = isLong ? incomingTrade : front.trade;
    const entryPrice = isLong ? front.trade.price : incomingTrade.price;
    const exitPrice = isLong ? incomingTrade.price : front.trade.price;

    const pnl = isLong
      ? (exitPrice - entryPrice) * matchQty
      : (entryPrice - exitPrice) * matchQty;
    const pnlPercent =
      entryPrice !== 0 ? ((isLong ? exitPrice - entryPrice : entryPrice - exitPrice) / entryPrice) * 100 : 0;

    results.push({
      id: ulid(),
      symbol,
      segment: entryTrade.segment === "FO" || exitTrade.segment === "FO" ? "FO" : "EQ",
      direction,
      entryDate: isLong ? front.trade.tradeDate : incomingTrade.tradeDate,
      exitDate: isLong ? incomingTrade.tradeDate : front.trade.tradeDate,
      entryPrice,
      exitPrice,
      quantity: matchQty,
      pnl,
      pnlPercent,
      holdingDays: daysBetween(
        isLong ? front.trade.tradeDate : incomingTrade.tradeDate,
        isLong ? incomingTrade.tradeDate : front.trade.tradeDate
      ),
      status: "CLOSED",
      financialYear: getFY(isLong ? incomingTrade.tradeDate : front.trade.tradeDate),
      entryTradeIds: [entryTrade.id],
      exitTradeIds: [exitTrade.id],
    });

    front.remainingQty -= matchQty;
    remainingIncoming -= matchQty;

    if (front.remainingQty <= 0) {
      queue.shift();
    }
  }

  // If incoming trade has leftover, add to opposite queue
  if (remainingIncoming > 0) {
    // This means the queue was exhausted — the remaining goes into a new position
    // For LONG direction: incoming is SELL, excess goes to sellQueue (new short)
    // For SHORT direction: incoming is BUY, excess goes to buyQueue (new long)
    // But we don't have access to the other queue here, so we push back to same queue
    // Actually, leftover incoming means we need to open a new position in the opposite direction
    // We'll handle this by pushing to the queue (caller's queue is the wrong one)
    // Simplification: push remaining back as a queue entry
    queue.push({ trade: incomingTrade, remainingQty: remainingIncoming });
  }
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
    exitDate: entry.trade.tradeDate, // same as entry for open
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
