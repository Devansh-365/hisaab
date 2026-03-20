import Papa from "papaparse";
import { ulid } from "ulid";
import type { ParseResult } from "@/lib/types";
import { detectBroker, getFileExtension } from "./detect-broker";
import { parseZerodha } from "./zerodha";
import { parseGroww } from "./groww";
import { parseUpstox } from "./upstox";
import { parseAngel } from "./angel";

/** Parse Groww CSV (as opposed to XLSX) by converting to row objects first */
function parseGrowwCSV(
  csvText: string,
  fileName: string,
  importId: string
): ParseResult {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.data.length === 0) {
    return {
      trades: [],
      errors: [{ row: 0, field: "file", value: fileName, message: "No data rows found" }],
      meta: { broker: "groww", fileName, totalRows: 0, parsedRows: 0, skippedRows: 0, dateRange: null },
    };
  }

  const headers = Object.keys(parsed.data[0]);
  return parseGroww(parsed.data, headers, fileName, importId);
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = getFileExtension(file.name);
  const importId = ulid();

  if (ext === "csv") {
    return parseCSV(file, importId);
  }

  if (ext === "xlsx" || ext === "xls") {
    return parseXLSX(file, importId);
  }

  return {
    trades: [],
    errors: [{ row: 0, field: "file", value: file.name, message: `Unsupported file type: .${ext}` }],
    meta: {
      broker: "unknown",
      fileName: file.name,
      totalRows: 0,
      parsedRows: 0,
      skippedRows: 0,
      dateRange: null,
    },
  };
}

async function parseCSV(file: File, importId: string): Promise<ParseResult> {
  const text = await file.text();

  // Extract headers to detect broker
  const firstLine = text.split("\n")[0];
  const headers = firstLine.split(",").map((h) => h.trim().replace(/"/g, ""));
  const broker = detectBroker(headers);

  if (broker === "zerodha") return parseZerodha(text, file.name, importId);
  if (broker === "upstox") return parseUpstox(text, file.name, importId);
  if (broker === "angel") return parseAngel(text, file.name, importId);
  if (broker === "groww") return parseGrowwCSV(text, file.name, importId);

  return {
    trades: [],
    errors: [
      {
        row: 0,
        field: "broker",
        value: headers.join(", "),
        message: "Could not detect broker from CSV headers. Supported: Zerodha (Kite), Groww, Upstox, Angel One.",
      },
    ],
    meta: {
      broker: "unknown",
      fileName: file.name,
      totalRows: 0,
      parsedRows: 0,
      skippedRows: 0,
      dateRange: null,
    },
  };
}

async function parseXLSX(file: File, importId: string): Promise<ParseResult> {
  try {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
  });

  if (jsonRows.length === 0) {
    return {
      trades: [],
      errors: [{ row: 0, field: "file", value: file.name, message: "Empty spreadsheet" }],
      meta: {
        broker: "unknown",
        fileName: file.name,
        totalRows: 0,
        parsedRows: 0,
        skippedRows: 0,
        dateRange: null,
      },
    };
  }

  const headers = Object.keys(jsonRows[0]);
  const broker = detectBroker(headers);

  if (broker === "groww") {
    return parseGroww(jsonRows, headers, file.name, importId);
  }

  // For undetected XLSX files, try Groww parser as fallback
  // since Groww is the most common XLSX source for Indian traders
  if (!broker) {
    const result = parseGroww(jsonRows, headers, file.name, importId);
    if (result.trades.length > 0) return result;

    return {
      trades: [],
      errors: [{
        row: 0,
        field: "broker",
        value: headers.slice(0, 5).join(", "),
        message: "Could not detect broker from XLSX headers. Supported: Groww, Zerodha, Upstox, Angel One.",
      }],
      meta: { broker: "unknown", fileName: file.name, totalRows: jsonRows.length, parsedRows: 0, skippedRows: 0, dateRange: null },
    };
  }

  // Handle other brokers that may export XLSX
  // Convert XLSX rows back through the appropriate parser
  const csvText = Papa.unparse(jsonRows);
  if (broker === "zerodha") return parseZerodha(csvText, file.name, importId);
  if (broker === "upstox") return parseUpstox(csvText, file.name, importId);
  if (broker === "angel") return parseAngel(csvText, file.name, importId);

  return parseGroww(jsonRows, headers, file.name, importId);
  } catch (err) {
    return {
      trades: [],
      errors: [{
        row: 0,
        field: "file",
        value: file.name,
        message: `Failed to parse XLSX: ${err instanceof Error ? err.message : "Unknown error"}`,
      }],
      meta: { broker: "unknown", fileName: file.name, totalRows: 0, parsedRows: 0, skippedRows: 0, dateRange: null },
    };
  }
}
