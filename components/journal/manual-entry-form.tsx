"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeTrades, storeMatchedTrades } from "@/hooks/use-trades";
import { matchTradesFIFO } from "@/lib/matching/fifo";
import { db } from "@/lib/storage/db";
import { ulid } from "ulid";
import { getFY } from "@/lib/utils/fy";
import { Plus, Check } from "lucide-react";
import type { TradeRecord } from "@/lib/types";

export function ManualEntryForm() {
  const [symbol, setSymbol] = useState("");
  const [tradeDate, setTradeDate] = useState("");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol || !tradeDate || !quantity || !price) return;

    setStatus("saving");

    const dateISO = new Date(tradeDate).toISOString();
    const qty = parseInt(quantity);
    const prc = parseFloat(price);

    const trade: TradeRecord = {
      id: ulid(),
      broker: "manual",
      symbol: symbol.toUpperCase().trim(),
      exchange: "NSE",
      segment: "EQ",
      tradeType,
      quantity: qty,
      price: prc,
      amount: qty * prc,
      tradeDate: dateISO,
      tradeId: `manual-${ulid()}`,
      importId: "manual-entry",
      importedAt: new Date().toISOString(),
      financialYear: getFY(dateISO),
    };

    await storeTrades([trade]);

    const allTrades = await db.trades.toArray();
    const matched = matchTradesFIFO(allTrades);
    await storeMatchedTrades(matched);

    setStatus("saved");
    setSymbol("");
    setTradeDate("");
    setQuantity("");
    setPrice("");

    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5 col-span-2 sm:col-span-1">
        <Label className="text-xs">Symbol</Label>
        <Input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="RELIANCE"
          className="h-9"
          required
        />
      </div>
      <div className="space-y-1.5 col-span-2 sm:col-span-1">
        <Label className="text-xs">Date</Label>
        <Input
          type="date"
          value={tradeDate}
          onChange={(e) => setTradeDate(e.target.value)}
          className="h-9"
          required
        />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label className="text-xs">Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={tradeType === "BUY" ? "default" : "outline"}
            size="sm"
            onClick={() => setTradeType("BUY")}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            type="button"
            variant={tradeType === "SELL" ? "default" : "outline"}
            size="sm"
            onClick={() => setTradeType("SELL")}
            className="flex-1"
          >
            Sell
          </Button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Quantity</Label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="100"
          className="h-9"
          min={1}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Price</Label>
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="1500.00"
          className="h-9"
          step="0.01"
          min={0}
          required
        />
      </div>
      <div className="col-span-2 pt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={status === "saving"}
        >
          {status === "saved" ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Trade Added
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Trade
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
