import Dexie, { type EntityTable } from "dexie";
import type { TradeRecord, MatchedTradeRecord, ImportRecord } from "@/lib/types";

class HisaabDB extends Dexie {
  trades!: EntityTable<TradeRecord, "id">;
  matchedTrades!: EntityTable<MatchedTradeRecord, "id">;
  imports!: EntityTable<ImportRecord, "id">;

  constructor() {
    super("hisaab");

    this.version(1).stores({
      trades:
        "id, [broker+tradeId+tradeDate], symbol, tradeDate, segment, financialYear, importId",
      matchedTrades:
        "id, symbol, entryDate, exitDate, status, financialYear, *tags",
      imports: "id, importedAt",
    });
  }
}

export const db = new HisaabDB();
