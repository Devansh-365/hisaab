"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [notes, setNotes] = useState("");
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

    // Re-match all trades
    const allTrades = await db.trades.toArray();
    const matched = matchTradesFIFO(allTrades);
    await storeMatchedTrades(matched);

    setStatus("saved");
    setSymbol("");
    setTradeDate("");
    setQuantity("");
    setPrice("");
    setNotes("");

    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Add Trade Manually</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Symbol</Label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="RELIANCE"
              className="h-8 text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Date</Label>
            <Input
              type="date"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant={tradeType === "BUY" ? "default" : "outline"}
                size="sm"
                onClick={() => setTradeType("BUY")}
                className="flex-1 text-xs"
              >
                Buy
              </Button>
              <Button
                type="button"
                variant={tradeType === "SELL" ? "default" : "outline"}
                size="sm"
                onClick={() => setTradeType("SELL")}
                className="flex-1 text-xs"
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
              className="h-8 text-xs"
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
              className="h-8 text-xs"
              step="0.01"
              min={0}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm" className="w-full" disabled={status === "saving"}>
              {status === "saved" ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Trade
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
