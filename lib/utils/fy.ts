/**
 * Indian Financial Year runs Apr 1 to Mar 31.
 * "FY2025-26" covers Apr 2025 to Mar 2026.
 *
 * All dates are handled in IST context (local timezone for Indian traders).
 * We use local Date methods (getMonth, getFullYear) not UTC, since broker
 * CSVs report trade dates in IST.
 */

export function getFY(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Use local month (IST) since all trade dates are IST
  const month = d.getMonth(); // 0-11
  const year = month >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY${year}-${(year + 1).toString().slice(-2)}`;
}

export function getFYDateRange(fy: string): { start: string; end: string } {
  const startYear = parseInt(fy.replace("FY", "").split("-")[0]);
  // Return ISO strings at midnight IST (UTC+5:30)
  // Apr 1 00:00 IST = Mar 31 18:30 UTC
  // Mar 31 23:59 IST = Mar 31 18:29 UTC
  return {
    start: `${startYear}-04-01T00:00:00+05:30`,
    end: `${startYear + 1}-03-31T23:59:59+05:30`,
  };
}

export function getAllFYs(trades: { financialYear: string }[]): string[] {
  const fys = new Set(trades.map((t) => t.financialYear));
  return Array.from(fys).sort().reverse();
}

export function getCurrentFY(): string {
  return getFY(new Date());
}
