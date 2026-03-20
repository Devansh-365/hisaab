import Papa from "papaparse";
import { ulid } from "ulid";
import type { ParseResult } from "@/lib/types";
import { detectBroker, getFileExtension } from "./detect-broker";
import { parseZerodha } from "./zerodha";
import { parseGroww } from "./groww";

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

  if (broker === "zerodha") {
    return parseZerodha(text, file.name, importId);
  }

  return {
    trades: [],
    errors: [
      {
        row: 0,
        field: "broker",
        value: headers.join(", "),
        message: "Could not detect broker from CSV headers. Currently supported: Zerodha, Groww.",
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

  // Try Groww anyway for XLSX since it's the most common XLSX source
  return parseGroww(jsonRows, headers, file.name, importId);
}
