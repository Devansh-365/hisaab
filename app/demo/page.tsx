"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateDemoTrades } from "@/lib/demo-data";
import { matchTradesFIFO } from "@/lib/matching/fifo";
import {
  storeTrades,
  storeMatchedTrades,
  storeImport,
  useTradeCount,
} from "@/hooks/use-trades";
import { db } from "@/lib/storage/db";
import { ulid } from "ulid";

export default function DemoPage() {
  const router = useRouter();
  const existingCount = useTradeCount();
  const [status, setStatus] = useState("Loading demo data...");
  const [needsConfirm, setNeedsConfirm] = useState(false);

  useEffect(() => {
    // If user has existing trades, ask before overwriting
    if (existingCount > 0 && !needsConfirm) {
      setNeedsConfirm(true);
      return;
    }
  }, [existingCount, needsConfirm]);

  async function loadDemo(clearFirst: boolean) {
    try {
      if (clearFirst) {
        await db.trades.clear();
        await db.matchedTrades.clear();
        await db.imports.clear();
      }

      const trades = generateDemoTrades();
      setStatus(`Processing ${trades.length} demo trades...`);
      setNeedsConfirm(false);

      for (const trade of trades) {
        await storeTrades([trade]);
      }

      await storeImport({
        id: ulid(),
        fileName: "demo-data.csv",
        broker: "zerodha",
        tradeCount: trades.length,
        importedAt: new Date().toISOString(),
        errors: 0,
      });

      setStatus("Matching trades...");
      const allTrades = await db.trades.toArray();
      const matched = matchTradesFIFO(allTrades);
      await storeMatchedTrades(matched);

      router.push("/dashboard");
    } catch (err) {
      setStatus(
        `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  // No existing data: load demo immediately
  useEffect(() => {
    if (existingCount === 0 && !needsConfirm) {
      loadDemo(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCount]);

  if (needsConfirm) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-sm font-medium">
            You have {existingCount} existing trades.
          </p>
          <p className="text-xs text-muted-foreground">
            Demo mode will add sample trades. What would you like to do?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => loadDemo(true)}
              className="px-4 py-2 text-xs rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              Clear & load demo
            </button>
            <button
              onClick={() => loadDemo(false)}
              className="px-4 py-2 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add demo alongside
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 text-xs rounded-md border border-input hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-primary font-medium">Hisaab</p>
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
