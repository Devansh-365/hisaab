import { ulid } from "ulid";
import type { TradeRecord, ParseResult, ParseError } from "@/lib/types";
import { parseTradeDate } from "@/lib/utils/dates";
import { getFY } from "@/lib/utils/fy";

interface GrowwRow {
  [key: string]: string | undefined;
}

function normalizeHeaders(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of headers) {
    map.set(h.trim().toLowerCase(), h);
  }
  return map;
}

function getVal(row: GrowwRow, headerMap: Map<string, string>, key: string): string {
  const originalKey = headerMap.get(key.toLowerCase());
  if (!originalKey) return "";
  return (row[originalKey] ?? "").trim();
}

/** Generate deterministic ID for dedup (Groww doesn't provide trade IDs) */
function hashTrade(symbol: string, date: string, type: string, qty: string, price: string): string {
  return `groww-${symbol}-${date}-${type}-${qty}-${price}`.replace(/\s+/g, "");
}

export function parseGroww(
  rows: GrowwRow[],
  headers: string[],
  fileName: string,
  importId: string
): ParseResult {
  const errors: ParseError[] = [];
  const trades: TradeRecord[] = [];
  const now = new Date().toISOString();
  const headerMap = normalizeHeaders(headers);

  let minDate = "";
  let maxDate = "";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const symbol = getVal(row, headerMap, "symbol");
    const rawDate =
      getVal(row, headerMap, "order execution time") ||
      getVal(row, headerMap, "trade date") ||
      getVal(row, headerMap, "date");

    const tradeDate = parseTradeDate(rawDate);
    if (!tradeDate) {
      errors.push({
        row: i + 2,
        field: "date",
        value: rawDate,
        message: "Invalid date format",
      });
      continue;
    }

    const rawType = getVal(row, headerMap, "trade type") || getVal(row, headerMap, "type");
    const tradeType = rawType.toUpperCase();
    if (tradeType !== "BUY" && tradeType !== "SELL") {
      errors.push({
        row: i + 2,
        field: "trade_type",
        value: rawType,
        message: 'Expected "BUY" or "SELL"',
      });
      continue;
    }

    const quantity = parseInt(getVal(row, headerMap, "quantity") || "0");
    const price = parseFloat(
      getVal(row, headerMap, "trade price") || getVal(row, headerMap, "price") || "0"
    );

    if (isNaN(quantity) || quantity <= 0) {
      errors.push({
        row: i + 2,
        field: "quantity",
        value: getVal(row, headerMap, "quantity"),
        message: "Invalid quantity",
      });
      continue;
    }

    if (isNaN(price) || price < 0) {
      errors.push({
        row: i + 2,
        field: "price",
        value: getVal(row, headerMap, "trade price"),
        message: "Invalid price",
      });
      continue;
    }

    if (!minDate || tradeDate < minDate) minDate = tradeDate;
    if (!maxDate || tradeDate > maxDate) maxDate = tradeDate;

    const exchange = (getVal(row, headerMap, "exchange") || "NSE").toUpperCase();

    trades.push({
      id: ulid(),
      broker: "groww",
      symbol: symbol.toUpperCase(),
      exchange: exchange === "BSE" ? "BSE" : "NSE",
      segment: "EQ", // Groww exports are primarily equity
      tradeType: tradeType as "BUY" | "SELL",
      quantity,
      price,
      amount: quantity * price,
      tradeDate,
      tradeId: hashTrade(symbol, rawDate, tradeType, String(quantity), String(price)),
      importId,
      importedAt: now,
      financialYear: getFY(tradeDate),
    });
  }

  return {
    trades,
    errors,
    meta: {
      broker: "groww",
      fileName,
      totalRows: rows.length,
      parsedRows: trades.length,
      skippedRows: errors.length,
      dateRange: minDate ? { from: minDate, to: maxDate } : null,
    },
  };
}
