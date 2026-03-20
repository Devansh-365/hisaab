# Hisaab — Technical Implementation Plan

**Author:** Devansh Tiwari
**Date:** 2026-03-20
**Status:** Draft
**Based on:** [PRD MVP](.pm/prd-mvp.md)

---

## 1. Architecture Overview

### Architecture Style: Static-Export SPA with Client-Side Storage

Hisaab is a **fully client-side application** — no backend, no API, no auth. The architecture is intentionally simple: a statically exported Next.js app that runs entirely in the browser.

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│                                                           │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │  Next.js  │──▶│  Parsing      │──▶│  FIFO Matching  │  │
│  │  App      │   │  Engine       │   │  Engine         │  │
│  │  (React)  │   │  (Papa Parse  │   │                 │  │
│  │          │   │   + SheetJS)  │   │                 │  │
│  └──────────┘   └──────────────┘   └────────┬────────┘  │
│       │                                       │           │
│       ▼                                       ▼           │
│  ┌──────────────────────────────────────────────────┐    │
│  │              Analytics Engine                      │    │
│  │  (KPIs, Behavioral, Monte Carlo, Tax)             │    │
│  └──────────────────────────────────────────────────┘    │
│       │                                                   │
│       ▼                                                   │
│  ┌──────────────────────────────────────────────────┐    │
│  │              IndexedDB (Dexie.js)                  │    │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────────────┐ │    │
│  │  │ trades  │ │ matched  │ │ annotations/tags    │ │    │
│  │  └─────────┘ └──────────┘ └────────────────────┘ │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ┌──────────────────────────────────────────────────┐    │
│  │              UI Layer                              │    │
│  │  shadcn/ui + Tailwind + Recharts                  │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
         │
         │ Static export (next export)
         ▼
┌─────────────────────┐
│  Vercel / GitHub     │
│  Pages (CDN)         │
│  No server needed    │
└─────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering | Static export (`output: 'export'`) | No server costs, CDN-only, works on GitHub Pages |
| Routing | Next.js App Router (client-side) | File-based routing, layouts, future RSC readiness for Metis sharing |
| State | React Context + Dexie.js liveQuery | No Redux needed — Dexie's reactive queries handle data state |
| Storage | IndexedDB via Dexie.js | Handles 100K+ trades, structured queries, no 5MB localStorage limit |
| File parsing | Web Workers | Heavy CSV/XLSX parsing off main thread to keep UI responsive |
| Charts | Recharts | Composable React components, good mobile support, lightweight |
| Styling | Tailwind CSS 4 + shadcn/ui | Consistent with Metis design system, rapid development |

---

## 2. Data Architecture

### 2.1 IndexedDB Schema (Dexie.js)

```typescript
// lib/storage/db.ts
import Dexie, { type EntityTable } from 'dexie';

interface TradeRecord {
  id: string;                    // ulid — unique, sortable
  broker: 'zerodha' | 'groww' | 'upstox' | 'angel' | 'manual';
  symbol: string;                // e.g., "RELIANCE", "NIFTY24MARFUT"
  isin?: string;
  exchange: 'NSE' | 'BSE';
  segment: 'EQ' | 'FO' | 'CD';
  tradeType: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  amount: number;                // quantity * price (pre-computed)
  tradeDate: string;             // ISO 8601 string (IndexedDB sorts strings)
  executionTime?: string;
  orderId?: string;
  tradeId?: string;
  importId: string;              // groups trades from the same file upload
  importedAt: string;            // when the file was uploaded
  financialYear: string;         // e.g., "FY2025-26" (derived)
}

interface MatchedTradeRecord {
  id: string;
  symbol: string;
  segment: 'EQ' | 'FO';
  direction: 'LONG' | 'SHORT';
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  holdingDays: number;
  status: 'CLOSED' | 'OPEN';
  financialYear: string;
  // Phase 2 fields (nullable, added later)
  notes?: string;
  tags?: string[];               // ["breakout", "momentum"]
  emotion?: string;              // "disciplined" | "fomo" | "revenge" | "fear"
  rating?: number;               // 1-5
  entryTradeIds: string[];       // references to raw trades
  exitTradeIds: string[];
}

interface ImportRecord {
  id: string;
  fileName: string;
  broker: string;
  tradeCount: number;
  importedAt: string;
  errors: number;
}

class HisaabDB extends Dexie {
  trades!: EntityTable<TradeRecord, 'id'>;
  matchedTrades!: EntityTable<MatchedTradeRecord, 'id'>;
  imports!: EntityTable<ImportRecord, 'id'>;

  constructor() {
    super('hisaab');

    this.version(1).stores({
      trades: 'id, [broker+tradeId+tradeDate], symbol, tradeDate, segment, financialYear, importId',
      matchedTrades: 'id, symbol, entryDate, exitDate, status, financialYear, *tags',
      imports: 'id, importedAt',
    });
  }
}

export const db = new HisaabDB();
```

**Index design rationale:**
- `[broker+tradeId+tradeDate]` — compound index for dedup on re-import
- `*tags` — Dexie multi-entry index for querying trades by any tag
- `financialYear` — fast filtering by FY (core to Indian trading context)
- Dates stored as ISO strings — IndexedDB sorts strings lexicographically, ISO 8601 sorts correctly

### 2.2 Data Flow Pipeline

```
CSV/XLSX File
    │
    ▼
┌─────────────────────┐
│  1. Broker Detection │   detect-broker.ts
│  (column headers)    │   Reads first few rows, matches against known patterns
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  2. Parse & Normalize│   parsers/zerodha.ts, parsers/groww.ts
│  (Web Worker)        │   Raw CSV → TradeRecord[]
│                      │   Runs in Worker to avoid blocking UI
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  3. Dedup & Store    │   storage/db.ts
│  (IndexedDB)         │   Check compound index, skip existing, bulk insert
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  4. FIFO Matching    │   matching/fifo.ts
│                      │   Group by symbol → sort by date → match FIFO
│                      │   Outputs MatchedTradeRecord[]
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  5. Analytics Compute│   analytics/basic.ts
│                      │   KPIs computed on-demand from matched trades
│                      │   NOT stored — derived from source data
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│  6. Render Dashboard │   React components via Dexie liveQuery
└─────────────────────┘
```

**Important: Analytics are NOT stored.** KPIs, charts, and metrics are computed on-the-fly from matched trades. This keeps the storage schema simple and avoids stale data. For 10K matched trades, computation takes <50ms — no need to cache.

---

## 3. Module Design

### 3.1 Broker Parsers (`lib/parsers/`)

Each parser implements a common interface:

```typescript
// lib/parsers/types.ts
interface ParseResult {
  trades: TradeRecord[];
  errors: ParseError[];
  meta: {
    broker: string;
    fileName: string;
    totalRows: number;
    parsedRows: number;
    skippedRows: number;
    dateRange: { from: string; to: string };
  };
}

interface ParseError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface BrokerParser {
  readonly broker: string;
  readonly supportedFormats: string[];     // ['csv']
  detect(headers: string[]): boolean;      // Can this parser handle this file?
  parse(data: string | ArrayBuffer): ParseResult;
}
```

**Broker detection strategy:**
```typescript
// lib/parsers/detect-broker.ts
const BROKER_SIGNATURES: Record<string, string[]> = {
  zerodha: ['trade_date', 'tradingsymbol', 'exchange', 'quantity', 'price'],
  groww:   ['Symbol', 'Trade Type', 'Quantity', 'Trade Price', 'Order Execution Time'],
  upstox:  ['exchange', 'symbol', 'token', 'trade_type', 'quantity'],
  angel:   ['Trade Date', 'Script Name', 'Buy/Sell', 'Quantity'],
};

export function detectBroker(headers: string[]): string | null {
  const normalized = headers.map(h => h.trim().toLowerCase());
  for (const [broker, sig] of Object.entries(BROKER_SIGNATURES)) {
    const sigNorm = sig.map(s => s.toLowerCase());
    if (sigNorm.every(col => normalized.includes(col))) return broker;
  }
  return null;
}
```

**Zerodha parser (primary, Phase 1):**
- Input: CSV from Zerodha Console > Tradebook
- Columns: `trade_date, tradingsymbol, exchange, segment, trade_type, quantity, price, order_id, trade_id`
- Date format: `YYYY-MM-DD` (Zerodha uses this consistently)
- F&O symbols: `NIFTY2430321000CE` → needs segment extraction from symbol
- Uses Papa Parse with `worker: false` (we manage our own workers)

**Groww parser (Phase 1):**
- Input: XLSX from Groww portfolio export
- Uses SheetJS to convert XLSX → JSON rows
- Date format: `DD MMM YYYY` (e.g., "20 Mar 2026")
- Groww does not provide trade IDs — generate deterministic hash from (symbol + date + type + qty + price)

### 3.2 FIFO Matching Engine (`lib/matching/fifo.ts`)

The core algorithm that converts raw BUY/SELL trades into matched P&L entries.

```typescript
// Pseudocode for FIFO matching
function matchTradesFIFO(trades: TradeRecord[]): MatchedTradeRecord[] {
  // 1. Group trades by symbol
  const bySymbol = groupBy(trades, 'symbol');
  const matched: MatchedTradeRecord[] = [];

  for (const [symbol, symbolTrades] of Object.entries(bySymbol)) {
    // 2. Sort by date (chronological)
    const sorted = symbolTrades.sort((a, b) => a.tradeDate.localeCompare(b.tradeDate));

    // 3. Maintain queues for buy and sell sides
    const buyQueue: QueueEntry[] = [];   // FIFO queue
    const sellQueue: QueueEntry[] = [];  // For shorts (sell first)

    for (const trade of sorted) {
      if (trade.tradeType === 'BUY') {
        // Try to close a short position first
        if (sellQueue.length > 0) {
          // Match against oldest short (FIFO)
          matchAgainstQueue(sellQueue, trade, 'SHORT', matched);
        } else {
          buyQueue.push({ ...trade, remainingQty: trade.quantity });
        }
      } else {
        // SELL — try to close a long position
        if (buyQueue.length > 0) {
          matchAgainstQueue(buyQueue, trade, 'LONG', matched);
        } else {
          sellQueue.push({ ...trade, remainingQty: trade.quantity });
        }
      }
    }

    // 4. Remaining in queues = open positions
    for (const entry of [...buyQueue, ...sellQueue]) {
      matched.push(createOpenPosition(entry));
    }
  }

  return matched;
}
```

**Edge cases to handle:**
- Partial fills: Buy 100, sell 60 → matched trade (60) + remaining buy (40) in queue
- Multiple partial exits: Buy 100 → sell 30 → sell 30 → sell 40 = 3 matched trades
- Intraday round trips: Buy + sell same day, same symbol
- F&O expiry: Options expire worthless → need to handle as exit at 0
- Corporate actions: Stock splits change quantity (out of scope for MVP, document as known limitation)

### 3.3 Analytics Engine (`lib/analytics/`)

**Basic analytics (`basic.ts`) — Phase 1:**

```typescript
interface DashboardKPIs {
  netPnl: number;
  totalTrades: number;
  winRate: number;               // winners / total closed trades
  profitFactor: number;          // gross profit / gross loss
  avgWin: number;
  avgLoss: number;
  bestTrade: MatchedTradeRecord;
  worstTrade: MatchedTradeRecord;
  avgHoldingDays: number;
  openPositions: number;
}

function computeKPIs(trades: MatchedTradeRecord[]): DashboardKPIs {
  const closed = trades.filter(t => t.status === 'CLOSED');
  const winners = closed.filter(t => t.pnl > 0);
  const losers = closed.filter(t => t.pnl < 0);

  const grossProfit = winners.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losers.reduce((sum, t) => sum + t.pnl, 0));

  return {
    netPnl: grossProfit - grossLoss,
    totalTrades: closed.length,
    winRate: closed.length > 0 ? (winners.length / closed.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    avgWin: winners.length > 0 ? grossProfit / winners.length : 0,
    avgLoss: losers.length > 0 ? grossLoss / losers.length : 0,
    bestTrade: maxBy(closed, 'pnl'),
    worstTrade: minBy(closed, 'pnl'),
    avgHoldingDays: mean(closed.map(t => t.holdingDays)),
    openPositions: trades.filter(t => t.status === 'OPEN').length,
  };
}
```

**Chart data generators:**
- `cumulativePnl(trades)` — sorted by exitDate, running sum of P&L → line chart data
- `monthlyPnl(trades)` — group by YYYY-MM, sum P&L → bar chart data
- `pnlDistribution(trades)` — histogram buckets of P&L amounts

**Advanced analytics (`advanced.ts`) — Phase 3:**
- Monte Carlo: Web Worker, 1000 simulations, random resampling of trade returns
- Sharpe ratio: `(mean return - risk-free rate) / std dev`, using Indian T-bill rate (~6.5%)
- Max drawdown: Peak-to-trough on cumulative equity curve
- Kelly criterion: `W - (1-W)/R` where W=win rate, R=avg win/avg loss

**Behavioral analytics (`behavioral.ts`) — Phase 3:**
- Group trades by `new Date(entryDate).getDay()` → day-of-week performance
- Group by holding period buckets (intraday, 1-3d, 1w, 1m+)
- Streak analysis: consecutive wins/losses → performance after streak

### 3.4 Web Worker Strategy

Heavy computation runs in Web Workers to keep the UI thread free:

```
Main Thread                  Worker Thread
─────────────                ─────────────
User drops file
     │
     ├──► postMessage(file) ──► Parse CSV (Papa Parse)
     │                          Normalize rows
     │    ◄── onmessage ◄───── Return TradeRecord[]
     │
     ├──► Store in IndexedDB
     │
     ├──► postMessage(trades) ─► FIFO matching
     │    ◄── onmessage ◄───── Return MatchedTradeRecord[]
     │
     ├──► Store matched trades
     │
     └──► Render dashboard (main thread, from Dexie liveQuery)
```

**Implementation approach:**
- Use `new Worker(new URL('./parser.worker.ts', import.meta.url))` — Next.js + webpack support
- One worker for parsing, one for matching (can run concurrently in Phase 3 for large files)
- For Phase 1, if worker setup adds complexity, parsing on main thread is acceptable for <5000 rows — optimize later

---

## 4. Routing & Page Architecture

### Static Export Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',              // Full static export — NO server
  images: { unoptimized: true }, // No Image Optimization API
  trailingSlash: true,           // Better compatibility with static hosts
};

export default config;
```

### Route Map

```
/                    → Upload page (entry point, hero + drop zone)
/dashboard/          → P&L dashboard (KPIs + charts + trade table)
/journal/            → Trade journal with notes/tags (Phase 2)
/calendar/           → Calendar heatmap (Phase 2)
/analytics/          → Advanced analytics (Phase 3)
/demo/               → Demo mode with sample data
/settings/           → Data management (export, clear, import history)
```

### Layout Structure

```typescript
// app/layout.tsx — Root layout
// - Theme provider (dark/light mode)
// - Sidebar navigation (desktop) / bottom tab bar (mobile)
// - Dexie provider (database instance)
// - Toaster for notifications

// app/(app)/layout.tsx — App shell (all pages except landing)
// - Sidebar with nav links
// - Top bar with FY selector, data summary
// - Main content area
```

**Navigation pattern:**
- Desktop: Fixed left sidebar (collapsible), 220px width
- Mobile: Bottom tab bar with 4-5 icons (Upload, Dashboard, Journal, Calendar, Settings)
- No top navbar — maximize vertical space for charts on mobile

---

## 5. State Management Strategy

### No Redux. Context + Dexie liveQuery.

The app has two kinds of state:

**1. Persistent data (IndexedDB via Dexie):**
```typescript
// Use Dexie's useLiveQuery hook — auto-updates UI when data changes
import { useLiveQuery } from 'dexie-react-hooks';

function Dashboard() {
  // Reactive — re-renders when trades change in IndexedDB
  const matchedTrades = useLiveQuery(
    () => db.matchedTrades.where('financialYear').equals(selectedFY).toArray()
  );

  const kpis = useMemo(() => computeKPIs(matchedTrades ?? []), [matchedTrades]);
  // ...
}
```

**2. UI state (React Context):**
```typescript
// contexts/app-context.tsx
interface AppState {
  selectedFY: string;             // "FY2025-26"
  isImporting: boolean;
  importProgress: number;         // 0-100
  sidebarOpen: boolean;
  activeFilters: {
    segment?: 'EQ' | 'FO';
    symbol?: string;
    dateRange?: { from: string; to: string };
  };
}
```

**Why not Zustand/Jotai/Redux?**
- Data layer is already reactive via Dexie liveQuery — covers 80% of state needs
- UI state is minimal and co-located — React Context handles it
- Adding a state library would be over-engineering for this scope
- If Phase 2+ needs complex client state (e.g., undo/redo for annotations), introduce Zustand then

---

## 6. Component Architecture

### Design System: shadcn/ui + Custom Chart Components

```
components/
├── ui/                          # shadcn/ui primitives (button, card, dialog, etc.)
│
├── layout/
│   ├── sidebar.tsx              # Desktop sidebar navigation
│   ├── bottom-nav.tsx           # Mobile bottom tab bar
│   ├── fy-selector.tsx          # Financial year dropdown
│   └── theme-toggle.tsx         # Dark/light mode switch
│
├── upload/
│   ├── drop-zone.tsx            # Drag-and-drop file upload area
│   ├── broker-chips.tsx         # Broker selection (auto-detected)
│   ├── parse-progress.tsx       # Progress bar + row count during import
│   └── parse-errors.tsx         # Display parsing errors with row details
│
├── dashboard/
│   ├── kpi-cards.tsx            # Top row: Net P&L, Win Rate, Profit Factor, etc.
│   ├── pnl-curve.tsx            # Cumulative P&L line chart (Recharts)
│   ├── monthly-bars.tsx         # Monthly P&L bar chart
│   ├── pnl-distribution.tsx     # Win/loss histogram
│   ├── trade-table.tsx          # Sortable, filterable trade table
│   └── open-positions.tsx       # Unmatched/open position list
│
├── journal/                     # Phase 2
│   ├── trade-row.tsx            # Trade row with inline note/tag editing
│   ├── note-editor.tsx          # Markdown-ish note input
│   ├── tag-picker.tsx           # Strategy + emotion tag selector
│   └── star-rating.tsx          # 1-5 trade quality rating
│
├── calendar/                    # Phase 2
│   └── heatmap.tsx              # Calendar grid with P&L intensity
│
└── analytics/                   # Phase 3
    ├── day-of-week.tsx          # Day-of-week performance bars
    ├── holding-analysis.tsx     # Holding period vs returns
    ├── monte-carlo.tsx          # Monte Carlo simulation chart
    └── risk-metrics.tsx         # Sharpe, drawdown, Kelly display
```

### Key Component Patterns

**KPI Card (reusable):**
```typescript
interface KPICardProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'percent' | 'number';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}
```

**Trade Table (the most complex component):**
- Uses `@tanstack/react-table` for sorting, filtering, pagination
- Virtual scrolling for 10K+ rows (use `@tanstack/react-virtual`)
- Column resize on desktop, horizontal scroll on mobile
- Color-coded rows: green bg for profit, red bg for loss (subtle)
- Click row → expand to show entry/exit details, notes (Phase 2)

---

## 7. File Processing & Performance

### Performance Budgets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Parse 1000-row CSV | <1s | Instant feel |
| Parse 10K-row CSV | <3s | Large trader file |
| FIFO match 10K trades | <500ms | Main thread acceptable |
| Dashboard render | <200ms | 60fps feel |
| Initial page load | <2s (3G) | Mobile-first Indian users |
| JS bundle (gzip) | <150KB | Critical for mobile |

### Bundle Splitting Strategy

```
Route-based code splitting (automatic with Next.js App Router):

/ (upload)           → ~40KB  (drop zone, Papa Parse lazy-loaded)
/dashboard           → ~80KB  (Recharts, trade table, analytics)
/journal             → ~30KB  (note editor, tag picker)
/analytics           → ~60KB  (Monte Carlo worker, advanced charts)

Heavy libs loaded dynamically:
- Papa Parse:  import('papaparse')           → only on upload
- SheetJS:     import('xlsx')                → only for .xlsx files
- Recharts:    import('recharts')            → only on dashboard
- react-table: import('@tanstack/react-table') → only on trade table
```

### Dynamic Imports Pattern

```typescript
// Lazy load Papa Parse only when user uploads a file
async function handleFile(file: File) {
  if (file.name.endsWith('.csv')) {
    const Papa = (await import('papaparse')).default;
    Papa.parse(file, { /* config */ });
  } else if (file.name.endsWith('.xlsx')) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer());
    // ...
  }
}
```

---

## 8. Utility Layer

### INR Formatting (`lib/utils/format.ts`)

```typescript
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// ₹1,25,000 (Indian grouping: lakhs, crores)
export function formatINR(amount: number): string {
  return inrFormatter.format(amount);
}

// +₹1,25,000 or -₹50,000 with color classes
export function formatPnl(amount: number): { text: string; className: string } {
  const prefix = amount >= 0 ? '+' : '';
  return {
    text: `${prefix}${formatINR(amount)}`,
    className: amount >= 0 ? 'text-green-600' : 'text-red-600',
  };
}
```

### Financial Year Helpers (`lib/utils/fy.ts`)

```typescript
// Indian FY runs Apr 1 to Mar 31
export function getFY(date: Date | string): string {
  const d = new Date(date);
  const year = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY${year}-${(year + 1).toString().slice(-2)}`;
  // e.g., "FY2025-26" for any date from Apr 2025 to Mar 2026
}

export function getFYDateRange(fy: string): { start: Date; end: Date } {
  const startYear = parseInt(fy.replace('FY', '').split('-')[0]);
  return {
    start: new Date(startYear, 3, 1),      // Apr 1
    end: new Date(startYear + 1, 2, 31),   // Mar 31
  };
}
```

### ID Generation

```typescript
// Use ULID — sortable, unique, no external deps
// monotonically increasing = natural sort order in IndexedDB
import { ulid } from 'ulid';

export function generateId(): string {
  return ulid();
}
```

---

## 9. Phase-wise Implementation Sequence

### Phase 1: "The Hook" — 4-5 weeks

```
Week 1: Project Setup + Core Infrastructure
├── Next.js 15 project scaffold (App Router, TypeScript, Tailwind, shadcn/ui)
├── Dexie.js database setup with schema v1
├── Shared types (TradeRecord, MatchedTradeRecord)
├── Utility functions (INR format, FY helpers, ID generation)
├── Root layout with basic navigation shell
└── CI: ESLint + Prettier + TypeScript strict mode

Week 2: Parser Engine
├── Broker detection module
├── Zerodha CSV parser (primary)
├── Groww XLSX parser (secondary)
├── Parser test suite with real anonymized broker files
├── Drop zone component with drag-and-drop + file picker
└── Parse progress and error display

Week 3: FIFO Engine + Storage
├── FIFO matching algorithm
├── Partial fill handling
├── Long + short position support
├── Open position tracking
├── IndexedDB storage layer (dedup, bulk insert)
├── FIFO test suite (edge cases: partials, intraday, shorts)
└── Import history tracking

Week 4: Dashboard
├── KPI cards component
├── Cumulative P&L curve (Recharts)
├── Monthly P&L bars
├── Win/loss distribution histogram
├── Trade table with sort/filter/search
├── Open positions display
├── FY selector (filter all data by financial year)
└── Mobile responsive pass

Week 5: Polish + Demo + Launch Prep
├── Demo mode with sample CSV data
├── Settings page (export JSON, clear data, import history)
├── Dark/light mode toggle
├── PWA manifest (basic — full PWA in Phase 4)
├── Performance optimization (lazy loading, bundle analysis)
├── Error boundaries and empty states
├── README with hero screenshot/GIF
└── Deploy to Vercel
```

### Phase 2: "The Journal" — 3 weeks

```
Week 6-7: Annotations + Manual Entry
├── Trade row expansion with note editor
├── Tag system (strategy tags + emotion tags)
├── Star rating component
├── Manual trade entry form
├── Strategy analytics breakdown page
└── IndexedDB schema migration (v1 → v2, add annotation fields)

Week 8: Calendar + Streak
├── Calendar heatmap component
├── Daily P&L aggregation
├── Click-to-expand day detail
├── Journaling streak tracker
├── "Unreviewed trades" nudge system
```

### Phase 3: "The Edge" — 3-4 weeks

```
Week 9-10: Advanced Analytics
├── Monte Carlo simulation (Web Worker)
├── Sharpe ratio, max drawdown, Kelly criterion
├── Day-of-week and holding period analysis
├── Behavioral analytics page

Week 11-12: Export + Multi-Broker
├── CSV export of matched trades
├── PDF report generation (basic, client-side)
├── "Share your stats" image card generation (canvas API)
├── Upstox + Angel One parsers
├── Generic CSV column mapper UI
```

### Phase 4: "The Bridge" — 3 weeks

```
Week 13: AI Nudges
├── Pattern detection rules engine (client-side)
├── Insight card components
├── Optional: WebLLM integration for natural language

Week 14: Tax Reports
├── STCG/LTCG classification
├── Holding period computation
├── ₹1.25L LTCG exemption tracking
├── ITR-2/ITR-3 compatible CSV export

Week 15: PWA + Metis CTAs
├── Service worker (Serwist/next-pwa)
├── Offline-first caching strategy
├── Install prompt
├── Metis CTA components (contextual)
```

---

## 10. Testing Strategy

### Test Pyramid

```
                 ┌───────┐
                 │  E2E  │  Playwright: upload flow, demo mode
                 │  (5)  │  Critical happy paths only
                ┌┴───────┴┐
                │  Integ   │  Component tests with real IndexedDB
                │  (20)    │  Parser + matcher + render
               ┌┴─────────┴┐
               │   Unit     │  Parsers, FIFO matcher, analytics,
               │   (50+)    │  date utils, INR formatting
               └────────────┘
```

**Unit tests (Vitest):**
- Every parser: test against fixture files (anonymized real broker exports)
- FIFO matcher: comprehensive edge cases (partials, shorts, intraday, F&O expiry)
- Analytics: known input → known output for all KPI calculations
- Utilities: INR formatting, FY computation, date parsing

**Integration tests:**
- Full pipeline: CSV file → parse → match → compute KPIs → verify numbers
- IndexedDB: import, query, dedup, clear (use `fake-indexeddb` for CI)

**E2E tests (Playwright):**
- Upload Zerodha CSV → verify dashboard renders with correct net P&L
- Demo mode → dashboard loads with sample data
- Mobile viewport → navigation works, charts render

### Test Data Strategy
- Maintain fixture files in `__tests__/fixtures/` with anonymized real broker CSVs
- Include edge case files: empty file, single trade, 10K trades, mixed segments
- Golden output files: expected MatchedTradeRecord[] for each fixture

---

## 11. Deployment & Infrastructure

### Vercel (Primary)

```
GitHub repo → Vercel auto-deploy
├── Production: main branch → hisaab.dev (or hisaab.vercel.app)
├── Preview: PR branches → preview URLs
├── Build: `next build` (static export)
├── Output: /out directory → served from CDN edge
└── Cost: $0 (Hobby plan, static site)
```

### GitHub Pages (Alternative)

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v4
```

### No server. No database. No secrets. No environment variables.

The entire app is static HTML/JS/CSS served from a CDN. Deployment is just uploading files. This makes the project:
- Free to host (Vercel free tier, GitHub Pages, Netlify, Cloudflare Pages — all $0)
- Trivially self-hostable (`npx serve out/`)
- Zero operational burden

---

## 12. Security & Privacy Considerations

Since Hisaab is fully client-side with no backend:

| Concern | Approach |
|---------|----------|
| Data at rest | IndexedDB is sandboxed per origin; browser handles encryption if device is encrypted |
| Data in transit | No data leaves the browser — verify with CSP headers blocking outbound requests |
| XSS | Next.js auto-escapes JSX; no `dangerouslySetInnerHTML`; CSP headers |
| Dependency supply chain | Lock file (`package-lock.json`), audit deps, minimal runtime deps |
| CSV injection | Sanitize cell values on export (prefix `=`, `+`, `-`, `@` with `'`) |
| IndexedDB access | Same-origin policy protects data; warn users about shared computers |
| Demo data privacy | Sample data is fully synthetic, not derived from real trades |

**Content Security Policy (recommended):**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  connect-src 'none';              # ← No outbound network requests!
  img-src 'self' data: blob:;
  font-src 'self';
  worker-src 'self' blob:;
```

The `connect-src 'none'` header is the privacy guarantee — even if a dependency tries to phone home, the browser blocks it.

---

## 13. Developer Experience

### Project Setup Commands

```bash
npx create-next-app@latest hisaab --typescript --tailwind --eslint --app --src-dir=false
cd hisaab
npx shadcn@latest init
npm install dexie dexie-react-hooks papaparse xlsx recharts ulid
npm install -D @types/papaparse vitest @testing-library/react playwright
```

### Key Config Files

**TypeScript (strict):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**ESLint:** Next.js defaults + `plugin:@typescript-eslint/strict`

**Prettier:** Standard config, consistent formatting

### Git Workflow
- `main` — stable, deployed
- Feature branches: `feat/parser-zerodha`, `feat/fifo-engine`, etc.
- PR-based workflow, CI runs on every PR (lint + type-check + test)
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`

---

## 14. Risks & Technical Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| IndexedDB quota (~50MB default) | Heavy traders with years of data | Monitor storage usage, warn at 80%, offer JSON export/clear |
| Broker CSV format changes | Parser breaks silently | Version parsers, test against fixture files in CI, graceful error handling |
| FIFO matching correctness | Wrong P&L = trust destroyed | Extensive test suite, compare against known broker outputs, allow manual override |
| Web Worker support | Parsing blocks UI on old browsers | Feature-detect workers, fallback to main thread with chunked parsing |
| SheetJS bundle size (~200KB) | Slow initial load | Dynamic import only when .xlsx file detected |
| Next.js static export limitations | No API routes, no ISR | Design is intentionally client-only — this is a feature, not a limitation |
| Mobile performance (low-end Android) | Charts janky, table slow | Virtual scrolling, limit visible chart data points, test on real devices |

---

## 15. Dependencies & Versions

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "react-dom": "^19.x",
    "dexie": "^4.x",
    "dexie-react-hooks": "^1.x",
    "papaparse": "^5.x",
    "xlsx": "^0.18.x",
    "recharts": "^2.x",
    "@tanstack/react-table": "^8.x",
    "@tanstack/react-virtual": "^3.x",
    "ulid": "^2.x",
    "tailwindcss": "^4.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^3.x",
    "@testing-library/react": "^16.x",
    "playwright": "^1.x",
    "fake-indexeddb": "^6.x",
    "@types/papaparse": "^5.x"
  }
}
```

**Dependency philosophy:** Minimal runtime deps. Every dependency must justify its inclusion. Prefer browser APIs over libraries where practical.
