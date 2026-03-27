"use client";

/**
 * A static, non-interactive mockup of the Hisaab dashboard.
 * Used on the landing page to show visitors what they'll get.
 * Pure CSS -- no chart library, no real data.
 */
export function DashboardPreview() {
  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden select-none pointer-events-none">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-muted/30">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-red-400/80" />
          <div className="size-2.5 rounded-full bg-yellow-400/80" />
          <div className="size-2.5 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="text-[10px] text-muted-foreground/60 bg-muted/60 rounded px-3 py-0.5">
            hisaab.trymetis.app/dashboard
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-px bg-border/30">
        {[
          { label: "Net P&L", value: "+Rs 2,34,891", color: "text-emerald-500" },
          { label: "Win Rate", value: "58.3%", color: "text-foreground" },
          { label: "Profit Factor", value: "1.84", color: "text-foreground" },
          { label: "Total Trades", value: "847", color: "text-foreground" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card px-3 py-3 md:px-4 md:py-4">
            <p className="text-[9px] md:text-[10px] text-muted-foreground/70 uppercase tracking-wider">{label}</p>
            <p className={`text-sm md:text-lg font-bold tracking-tight mt-0.5 font-[family-name:var(--font-mono)] tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="px-4 py-4 md:px-6 md:py-5">
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-3">Cumulative P&L</p>
        {/* Fake equity curve using CSS */}
        <div className="relative h-24 md:h-32 w-full">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="var(--color-border)" strokeOpacity="0.3" strokeDasharray="4 4" />
            ))}
            {/* Area fill */}
            <path
              d="M0,85 C20,82 40,78 60,75 C80,72 100,68 130,55 C160,42 180,48 200,40 C220,32 240,38 260,30 C280,22 300,28 330,18 C350,12 370,15 400,10 L400,100 L0,100 Z"
              fill="url(#curve-fill)"
            />
            {/* Line */}
            <path
              d="M0,85 C20,82 40,78 60,75 C80,72 100,68 130,55 C160,42 180,48 200,40 C220,32 240,38 260,30 C280,22 300,28 330,18 C350,12 370,15 400,10"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Endpoint dot */}
            <circle cx="400" cy="10" r="3" fill="var(--color-primary)" />
          </svg>
        </div>
      </div>

      {/* Mini trade rows */}
      <div className="border-t border-border/30">
        {[
          { symbol: "RELIANCE", type: "LONG", pnl: "+Rs 12,450", pnlColor: "text-emerald-500", days: "3d" },
          { symbol: "HDFCBANK", type: "LONG", pnl: "-Rs 4,200", pnlColor: "text-red-400", days: "1d" },
          { symbol: "INFY", type: "SHORT", pnl: "+Rs 8,900", pnlColor: "text-emerald-500", days: "5d" },
        ].map(({ symbol, type, pnl, pnlColor, days }) => (
          <div key={symbol} className="flex items-center justify-between px-4 py-2 md:px-6 md:py-2.5 border-b border-border/20 last:border-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] md:text-xs font-medium">{symbol}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{type}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground/50">{days}</span>
              <span className={`text-[11px] md:text-xs font-semibold font-[family-name:var(--font-mono)] tabular-nums ${pnlColor}`}>{pnl}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
