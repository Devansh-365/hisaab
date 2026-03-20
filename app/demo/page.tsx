"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { generateDemoTrades } from "@/lib/demo-data";
import { matchTradesFIFO } from "@/lib/matching/fifo";
import { storeTrades, storeMatchedTrades, clearAllData, storeImport } from "@/hooks/use-trades";
import { ulid } from "ulid";

export default function DemoPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Loading demo data...");

  useEffect(() => {
    async function loadDemo() {
      try {
        // Clear existing data for clean demo
        await clearAllData();

        // Generate and store demo trades
        const trades = generateDemoTrades();
        setStatus(`Processing ${trades.length} demo trades...`);

        for (const trade of trades) {
          await storeTrades([trade]);
        }

        // Store import record
        await storeImport({
          id: ulid(),
          fileName: "demo-data.csv",
          broker: "zerodha",
          tradeCount: trades.length,
          importedAt: new Date().toISOString(),
          errors: 0,
        });

        // Match trades
        setStatus("Matching trades...");
        const matched = matchTradesFIFO(trades);
        await storeMatchedTrades(matched);

        setStatus("Redirecting to dashboard...");
        router.push("/dashboard");
      } catch (err) {
        setStatus(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    }

    loadDemo();
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 mx-auto rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}
