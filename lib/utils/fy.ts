/**
 * Indian Financial Year runs Apr 1 to Mar 31.
 * "FY2025-26" covers Apr 2025 – Mar 2026.
 */

export function getFY(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY${year}-${(year + 1).toString().slice(-2)}`;
}

export function getFYDateRange(fy: string): { start: Date; end: Date } {
  const startYear = parseInt(fy.replace("FY", "").split("-")[0]);
  return {
    start: new Date(startYear, 3, 1), // Apr 1
    end: new Date(startYear + 1, 2, 31), // Mar 31
  };
}

export function getAllFYs(trades: { financialYear: string }[]): string[] {
  const fys = new Set(trades.map((t) => t.financialYear));
  return Array.from(fys).sort().reverse();
}

export function getCurrentFY(): string {
  return getFY(new Date());
}
