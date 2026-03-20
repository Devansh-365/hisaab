import type { TradeRecord } from "@/lib/types";
import { ulid } from "ulid";
import { getFY } from "@/lib/utils/fy";

const DEMO_IMPORT_ID = "demo-import";

const symbols = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "TATAMOTORS",
  "BAJFINANCE",
  "WIPRO",
  "LT",
  "NIFTY25MARFUT",
  "BANKNIFTY25MARFUT",
];

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function randomPrice(base: number, variance: number): number {
  return Math.round((base + (Math.random() - 0.5) * variance) * 100) / 100;
}

export function generateDemoTrades(): TradeRecord[] {
  const trades: TradeRecord[] = [];
  const now = new Date().toISOString();
  const start = new Date("2025-04-01");
  const end = new Date("2026-03-15");

  const priceMap: Record<string, number> = {
    RELIANCE: 2900,
    TCS: 4200,
    INFY: 1800,
    HDFCBANK: 1700,
    ICICIBANK: 1250,
    SBIN: 820,
    TATAMOTORS: 750,
    BAJFINANCE: 7500,
    WIPRO: 480,
    LT: 3600,
    NIFTY25MARFUT: 23500,
    BANKNIFTY25MARFUT: 50200,
  };

  // Generate ~80 round-trip trades (buy + sell pairs)
  for (let i = 0; i < 80; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const basePrice = priceMap[symbol] ?? 1000;
    const isFO = symbol.includes("FUT");
    const segment = isFO ? "FO" : "EQ";
    const quantity = isFO
      ? [25, 50, 75][Math.floor(Math.random() * 3)]
      : [10, 25, 50, 100][Math.floor(Math.random() * 4)];

    const entryDate = randomDate(start, end);
    const holdDays = Math.floor(Math.random() * 30) + 1;
    const exitDate = new Date(
      entryDate.getTime() + holdDays * 24 * 60 * 60 * 1000
    );

    if (exitDate > end) continue;

    const entryPrice = randomPrice(basePrice, basePrice * 0.1);
    // Slight bias toward losses (realistic for most traders)
    const pnlBias = Math.random() > 0.45 ? 1 : -1;
    const exitPrice = randomPrice(
      entryPrice + pnlBias * basePrice * 0.03,
      basePrice * 0.05
    );

    const isShort = isFO && Math.random() > 0.6;

    // Entry
    trades.push({
      id: ulid(),
      broker: "zerodha",
      symbol,
      exchange: "NSE" as const,
      segment: segment as "EQ" | "FO",
      tradeType: isShort ? "SELL" : "BUY",
      quantity,
      price: entryPrice,
      amount: quantity * entryPrice,
      tradeDate: entryDate.toISOString(),
      tradeId: `DEMO-${i}-entry`,
      importId: DEMO_IMPORT_ID,
      importedAt: now,
      financialYear: getFY(entryDate),
    });

    // Exit
    trades.push({
      id: ulid(),
      broker: "zerodha",
      symbol,
      exchange: "NSE" as const,
      segment: segment as "EQ" | "FO",
      tradeType: isShort ? "BUY" : "SELL",
      quantity,
      price: exitPrice,
      amount: quantity * exitPrice,
      tradeDate: exitDate.toISOString(),
      tradeId: `DEMO-${i}-exit`,
      importId: DEMO_IMPORT_ID,
      importedAt: now,
      financialYear: getFY(exitDate),
    });
  }

  // Add a few open positions (buys without sells)
  for (let i = 0; i < 5; i++) {
    const symbol = symbols[Math.floor(Math.random() * 6)]; // equity only
    const basePrice = priceMap[symbol] ?? 1000;
    const entryDate = randomDate(new Date("2026-02-01"), end);
    const quantity = [10, 25, 50][Math.floor(Math.random() * 3)];

    trades.push({
      id: ulid(),
      broker: "zerodha",
      symbol,
      exchange: "NSE" as const,
      segment: "EQ",
      tradeType: "BUY",
      quantity,
      price: randomPrice(basePrice, basePrice * 0.05),
      amount: quantity * basePrice,
      tradeDate: entryDate.toISOString(),
      tradeId: `DEMO-open-${i}`,
      importId: DEMO_IMPORT_ID,
      importedAt: now,
      financialYear: getFY(entryDate),
    });
  }

  return trades.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));
}
