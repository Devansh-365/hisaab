/**
 * Parse various date formats from Indian broker CSVs.
 * Returns ISO 8601 string or null if unparseable.
 */
export function parseTradeDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // ISO format: 2025-03-20
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = trimmed.match(
    /^(\d{2})[/-](\d{2})[/-](\d{4})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?$/
  );
  if (ddmmyyyy) {
    const [, dd, mm, yyyy, time] = ddmmyyyy;
    const dateStr = `${yyyy}-${mm}-${dd}${time ? `T${time}` : ""}`;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // "20 Mar 2025" or "20 Mar 2025 14:30:00" (Groww format)
  const ddMMMYYYY = trimmed.match(
    /^(\d{1,2})\s+(\w{3})\s+(\d{4})(?:\s+(\d{2}:\d{2}(?::\d{2})?))?$/
  );
  if (ddMMMYYYY) {
    const [, dd, mmm, yyyy, time] = ddMMMYYYY;
    const dateStr = `${dd} ${mmm} ${yyyy}${time ? ` ${time}` : ""}`;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  // Fallback: let Date constructor try
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}
