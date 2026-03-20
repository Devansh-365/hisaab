"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/storage/db";
import type { TradeRecord, MatchedTradeRecord, ImportRecord } from "@/lib/types";

export function useTrades(financialYear?: string) {
  const trades = useLiveQuery(async () => {
    if (financialYear) {
      return db.trades.where("financialYear").equals(financialYear).toArray();
    }
    return db.trades.toArray();
  }, [financialYear]);

  return trades ?? [];
}

export function useMatchedTrades(financialYear?: string) {
  const trades = useLiveQuery(async () => {
    if (financialYear) {
      return db.matchedTrades
        .where("financialYear")
        .equals(financialYear)
        .toArray();
    }
    return db.matchedTrades.toArray();
  }, [financialYear]);

  return trades ?? [];
}

export function useImports() {
  const imports = useLiveQuery(async () => {
    return db.imports.orderBy("importedAt").reverse().toArray();
  }, []);

  return imports ?? [];
}

export function useTradeCount() {
  const count = useLiveQuery(() => db.trades.count(), []);
  return count ?? 0;
}

export async function storeTrades(trades: TradeRecord[]): Promise<number> {
  // Dedup by compound key: broker + tradeId + tradeDate
  let added = 0;
  for (const trade of trades) {
    if (trade.tradeId) {
      const existing = await db.trades
        .where("[broker+tradeId+tradeDate]")
        .equals([trade.broker, trade.tradeId, trade.tradeDate])
        .first();
      if (existing) continue;
    }
    await db.trades.add(trade);
    added++;
  }
  return added;
}

export async function storeMatchedTrades(
  trades: MatchedTradeRecord[]
): Promise<void> {
  // Clear old matched trades and recompute
  await db.matchedTrades.clear();
  await db.matchedTrades.bulkAdd(trades);
}

export async function storeImport(record: ImportRecord): Promise<void> {
  await db.imports.add(record);
}

export async function clearAllData(): Promise<void> {
  await db.trades.clear();
  await db.matchedTrades.clear();
  await db.imports.clear();
}

export async function exportAllData(): Promise<string> {
  const trades = await db.trades.toArray();
  const matchedTrades = await db.matchedTrades.toArray();
  const imports = await db.imports.toArray();
  return JSON.stringify({ trades, matchedTrades, imports }, null, 2);
}
