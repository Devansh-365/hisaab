import type { Broker } from "@/lib/types";

const BROKER_SIGNATURES: Record<string, string[]> = {
  zerodha: ["trade_date", "tradingsymbol", "exchange", "quantity", "price"],
  groww: ["symbol", "trade type", "quantity", "trade price"],
};

export function detectBroker(headers: string[]): Broker | null {
  const normalized = headers.map((h) => h.trim().toLowerCase());

  for (const [broker, signature] of Object.entries(BROKER_SIGNATURES)) {
    if (signature.every((col) => normalized.includes(col))) {
      return broker as Broker;
    }
  }

  return null;
}

export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}
