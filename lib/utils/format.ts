const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrDecimalFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatINR(amount: number, decimals = false): string {
  return decimals
    ? inrDecimalFormatter.format(amount)
    : inrFormatter.format(amount);
}

export function formatPnl(amount: number): { text: string; className: string } {
  const prefix = amount >= 0 ? "+" : "";
  return {
    text: `${prefix}${formatINR(amount)}`,
    className: amount >= 0 ? "text-green-600" : "text-red-600",
  };
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}
