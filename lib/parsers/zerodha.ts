import Papa from "papaparse";
import { ulid } from "ulid";
import type { TradeRecord, ParseResult, ParseError } from "@/lib/types";
import { parseTradeDate } from "@/lib/utils/dates";
import { getFY } from "@/lib/utils/fy";

interface ZerodhaRow {
  trade_date: string;
  tradingsymbol: string;
  exchange: string;
  segment: string;
  trade_type: string;
  quantity: string;
  price: string;
  order_id?: string;
  trade_id?: string;
  isin?: string;
}

function detectSegment(
  segment: string,
  symbol: string
): "EQ" | "FO" | "CD" {
  const seg = segment?.toUpperCase() ?? "";
  if (seg.includes("FO") || seg.includes("NFO") || seg.includes("BFO"))
    return "FO";
  if (seg.includes("CD") || seg.includes("CDS") || seg.includes("BCD"))
    return "CD";
  // Fallback: check symbol pattern for F&O
  if (/\d{2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)/i.test(symbol))
    return "FO";
  return "EQ";
}

export function parseZerodha(
  csvText: string,
  fileName: string,
  importId: string
): ParseResult {
  const errors: ParseError[] = [];
  const trades: TradeRecord[] = [];
  const now = new Date().toISOString();

  const parsed = Papa.parse<ZerodhaRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  let minDate = "";
  let maxDate = "";

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];

    const tradeDate = parseTradeDate(row.trade_date);
    if (!tradeDate) {
      errors.push({
        row: i + 2,
        field: "trade_date",
        value: row.trade_date,
        message: "Invalid date format",
      });
      continue;
    }

    const quantity = parseInt(row.quantity);
    const price = parseFloat(row.price);

    if (isNaN(quantity) || quantity <= 0) {
      errors.push({
        row: i + 2,
        field: "quantity",
        value: row.quantity,
        message: "Invalid quantity",
      });
      continue;
    }

    if (isNaN(price) || price < 0) {
      errors.push({
        row: i + 2,
        field: "price",
        value: row.price,
        message: "Invalid price",
      });
      continue;
    }

    const tradeType = row.trade_type?.trim().toUpperCase();
    if (tradeType !== "BUY" && tradeType !== "SELL") {
      errors.push({
        row: i + 2,
        field: "trade_type",
        value: row.trade_type,
        message: 'Expected "BUY" or "SELL"',
      });
      continue;
    }

    if (!minDate || tradeDate < minDate) minDate = tradeDate;
    if (!maxDate || tradeDate > maxDate) maxDate = tradeDate;

    trades.push({
      id: ulid(),
      broker: "zerodha",
      symbol: row.tradingsymbol?.trim().toUpperCase() ?? "",
      isin: row.isin?.trim() || undefined,
      exchange: (row.exchange?.trim().toUpperCase() ?? "NSE") as "NSE" | "BSE",
      segment: detectSegment(row.segment, row.tradingsymbol),
      tradeType: tradeType as "BUY" | "SELL",
      quantity,
      price,
      amount: quantity * price,
      tradeDate,
      orderId: row.order_id?.trim() || undefined,
      tradeId: row.trade_id?.trim() || undefined,
      importId,
      importedAt: now,
      financialYear: getFY(tradeDate),
    });
  }

  return {
    trades,
    errors,
    meta: {
      broker: "zerodha",
      fileName,
      totalRows: parsed.data.length,
      parsedRows: trades.length,
      skippedRows: errors.length,
      dateRange: minDate ? { from: minDate, to: maxDate } : null,
    },
  };
}
