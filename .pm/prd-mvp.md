# Hisaab — MVP Product Requirements Document

**Project:** Hisaab (Open Source Trading Journal for Indian Traders)
**Author:** Devansh Tiwari
**Date:** 2026-03-20
**Status:** Draft
**Parent Product:** Metis (AI-powered stock analysis)
**License:** MIT (open source)

---

## 1. Problem Statement

**91% of F&O traders lost money in FY25** (SEBI data). Aggregate losses: Rs 1.05 lakh crore.

The #1 differentiator between profitable and losing traders is journaling — yet <1% of Indian traders maintain any formal trade journal. The reason isn't motivation — it's **friction**. Manual data entry kills discipline. Existing tools are either too expensive (USD pricing), too basic (Zerodha Console), or require complex setup (database, auth, hosting).

**The core insight:** Traders don't need another app to maintain. They need to **upload a CSV and see their real win rate in 2 minutes** — zero signup, zero setup.

---

## 2. Product Vision

An **open-source, zero-auth, browser-only** trading journal that gives Indian traders instant P&L analytics from their broker CSV/XLSX exports. No signup, no database, no server — everything runs in the browser and stays on the user's device.

**Strategic role:** Acts as the top-of-funnel for Metis. Traders who discover their patterns here get a natural bridge to Metis's AI-powered stock analysis for improving their decisions.

```
Hisaab (free, open source)          Metis (paid, AI analysis)
─────────────────────────          ──────────────────────────
"See what you did wrong"    →→→    "Make better decisions next time"
Post-trade analysis                Pre-trade intelligence
```

---

## 3. Target Users

### Primary: Indian F&O & Swing Traders
- 10M+ active F&O traders, 91% losing money
- Currently using Google Sheets, Excel, or nothing
- Price-sensitive (75% earn <Rs 5L/year)
- Trade on Zerodha, Groww, Upstox, Angel One
- Mobile-first (77% of Indian web traffic)
- Want to improve but don't know where to start

### Secondary: Equity Delivery Investors
- 136M unique investors in India
- Track STCG/LTCG for tax filing
- Need scrip-wise P&L for ITR-2/ITR-3

---

## 4. Design Principles

1. **Zero friction** — No signup, no database, no API keys. Upload CSV → see dashboard.
2. **Instant gratification** — Show the "aha moment" within 2 minutes of first visit.
3. **Privacy-first** — All data stays in browser (localStorage/IndexedDB). Nothing leaves the device.
4. **India-native** — INR formatting, Indian broker support, FY (Apr-Mar) awareness, Indian tax structure.
5. **Mobile-optimized** — PWA installable, responsive-first, touch-friendly.
6. **Open source** — MIT license, clean code, well-documented, contributor-friendly.

---

## 5. Technical Constraints

| Constraint | Decision | Rationale |
|-----------|----------|-----------|
| No authentication | localStorage + IndexedDB | Zero friction, privacy-first |
| No database | Browser storage only | No server costs, no hosting complexity |
| No backend | Static Next.js export or client-only | Deployable on Vercel/Netlify/GitHub Pages |
| Framework | Next.js App Router + TypeScript | Same stack as Metis, code sharing potential |
| UI | Tailwind CSS + shadcn/ui | Same design system as Metis |
| Charts | Recharts or Lightweight Charts | Proven, performant |
| File parsing | Papa Parse (CSV) + SheetJS (XLSX) | Handles all broker formats |
| Data storage | IndexedDB via Dexie.js | Structured queries, large datasets |

---

## 6. MVP Phases

### Phase 1: "The Hook" — CSV Upload + Instant P&L Dashboard
> **Goal:** Upload broker CSV → see your real win rate in 2 minutes. No signup.

#### Features

**P1.1 — Broker CSV/XLSX Parser**
- Support Zerodha tradebook CSV (primary — largest user base)
- Support Groww XLSX export (secondary — fastest growing)
- Auto-detect broker from file structure (column headers, date formats)
- Normalize all trades into unified internal format
- Handle date format variations (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY)
- Handle F&O symbol naming conventions (NIFTY24MARFUT, BANKNIFTY24MAR52000CE)
- Display parsing errors clearly (which rows failed, why)

**Unified Trade Schema:**
```typescript
interface Trade {
  id: string
  broker: 'zerodha' | 'groww' | 'upstox' | 'angel'
  symbol: string
  isin?: string
  exchange: 'NSE' | 'BSE'
  segment: 'EQ' | 'FO' | 'CD'
  tradeType: 'BUY' | 'SELL'
  quantity: number
  price: number
  tradeDate: Date
  executionTime?: Date
  orderId?: string
  tradeId?: string
}
```

**P1.2 — FIFO Trade Matching**
- Match BUY/SELL trades using FIFO (First In, First Out) method
- Support partial fills (buy 100, sell 50 → matched + 50 open)
- Support LONG trades (buy first, sell later) — equity + F&O futures
- Support SHORT trades (sell first, buy to cover) — F&O only
- Track open/unmatched positions
- Financial year awareness (Apr 1 - Mar 31)

**Matched Trade Schema:**
```typescript
interface MatchedTrade {
  id: string
  symbol: string
  segment: 'EQ' | 'FO'
  direction: 'LONG' | 'SHORT'
  entryDate: Date
  exitDate: Date
  entryPrice: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  holdingDays: number
  status: 'CLOSED' | 'OPEN'
}
```

**P1.3 — Instant P&L Dashboard**
- **KPI Cards (top row):**
  - Net P&L (Rs) with color (green/red)
  - Win Rate (%)
  - Total Trades
  - Profit Factor (gross profit / gross loss)
  - Average Win vs Average Loss
  - Best Trade / Worst Trade
- **Charts:**
  - Cumulative P&L curve (line chart)
  - Monthly P&L bars (bar chart)
  - Win/Loss distribution (histogram)
- **Trade Table:**
  - Sortable by date, symbol, P&L, holding period
  - Color-coded rows (green for profit, red for loss)
  - Search/filter by symbol
- **Open Positions:**
  - List of unmatched buys with current unrealized status

**P1.4 — Data Persistence (IndexedDB)**
- Store parsed trades in IndexedDB (Dexie.js)
- Store matched trades separately
- Support multiple imports (append, not replace)
- Duplicate detection by trade ID + date
- Export all data as JSON backup
- "Clear all data" button with confirmation

**P1.5 — File Drop Zone / Upload UX**
- Drag-and-drop area prominently on first visit
- "See your real win rate in 2 minutes" headline
- Broker selection chips (auto-detect if possible)
- Progress indicator during parsing
- Success state → redirect to dashboard
- Demo mode with sample data (no upload needed)

#### Acceptance Criteria (Phase 1)
- [ ] User uploads Zerodha CSV → sees P&L dashboard in <5 seconds
- [ ] User uploads Groww XLSX → sees P&L dashboard in <5 seconds
- [ ] FIFO matching produces correct P&L for 100+ trades
- [ ] Partial fills handled correctly
- [ ] Data persists across browser sessions (IndexedDB)
- [ ] Works on mobile (responsive, touch-friendly)
- [ ] Demo mode works without any upload
- [ ] No network requests made with trade data (verify in DevTools)

---

### Phase 2: "The Journal" — Trade Notes, Tags & Manual Entry
> **Goal:** Turn passive analytics into an active journaling habit.

#### Features

**P2.1 — Trade Annotations**
- Add notes/rationale to any matched trade (post-hoc)
- Tag trades with strategy labels (e.g., "breakout", "mean reversion", "earnings play")
- Tag trades with emotional state (optional: discipline, FOMO, revenge, fear)
- Rate trade quality (1-5 stars) — separate from P&L outcome
- All annotations stored in IndexedDB alongside trade data

**P2.2 — Manual Trade Entry**
- Form to add trades not captured in CSV (other brokers, paper trades)
- Fields: symbol, date, buy/sell, quantity, price, notes
- Auto-match with existing trades if possible
- Support adding trades from unsupported brokers

**P2.3 — Strategy Analytics**
- P&L breakdown by strategy tag
- Win rate by strategy
- Best/worst performing strategies
- "Untagged trades" count (nudge to tag them)

**P2.4 — Calendar Heatmap**
- Monthly calendar grid showing daily P&L (green/red intensity)
- Click day → see trades for that day
- Financial year view (Apr-Mar)

**P2.5 — Journaling Streak**
- Track consecutive days with tagged/noted trades
- Streak counter on dashboard
- Gentle nudge: "You have 12 unreviewed trades from this week"

#### Acceptance Criteria (Phase 2)
- [ ] User can add notes and tags to any trade
- [ ] Strategy breakdown shows correct P&L per strategy
- [ ] Calendar heatmap renders correctly for FY
- [ ] Manual trade entry works and integrates with existing data
- [ ] Streak counter tracks consecutive journaling days

---

### Phase 3: "The Edge" — Advanced Analytics & Insights
> **Goal:** Surface patterns the trader can't see in a spreadsheet.

#### Features

**P3.1 — Advanced Performance Metrics**
- Expectancy (average $ per trade)
- Standard deviation of returns
- Sharpe ratio (simplified, using risk-free rate of Indian T-bill)
- Max drawdown (peak-to-trough)
- Recovery factor
- R-multiple distribution (if stop-loss tagged)

**P3.2 — Behavioral Analytics**
- Day-of-week performance (do you lose on Mondays?)
- Time-of-day performance (morning vs afternoon trades)
- Holding period analysis (are your quick trades better or worse?)
- Win rate on expiry days vs non-expiry days (F&O)
- Performance after consecutive wins/losses (tilt detection)
- Performance by market condition (if tagged)

**P3.3 — Risk Analysis**
- Position sizing recommendations (Kelly criterion, conservative 1%)
- Risk of ruin calculation
- Monte Carlo simulation (1000 runs, 95th percentile)
- Equity curve with drawdown bands

**P3.4 — Export & Sharing**
- Export matched trades as CSV
- Export P&L report as PDF (basic)
- "Share your stats" card (image) — watermarked "Powered by Hisaab"
- JSON export/import for backup and portability

**P3.5 — Multi-Broker Support Expansion**
- Upstox CSV parser
- Angel One CSV parser
- 5paisa CSV parser
- Generic CSV mapper (user maps columns manually)

#### Acceptance Criteria (Phase 3)
- [ ] Monte Carlo simulation runs in <3 seconds for 500 trades
- [ ] Day-of-week analysis correctly identifies patterns
- [ ] Shareable stats card generates correctly
- [ ] PDF export includes all KPIs and equity curve
- [ ] At least 4 Indian brokers supported

---

### Phase 4: "The Bridge" — Metis Integration & AI Nudges
> **Goal:** Create the natural upgrade path from Hisaab → Metis.

#### Features

**P4.1 — AI Behavioral Nudges (Client-Side)**
- Pattern detection runs locally (no API needed):
  - "You tend to hold losers 3x longer than winners"
  - "Your win rate drops 20% on expiry days"
  - "FOMO-tagged trades lose 2x more than disciplined ones"
- Display as cards on dashboard
- Optional: Use local LLM (WebLLM) for natural language summaries

**P4.2 — Metis Integration CTAs**
- After showing a losing trade pattern: "Want AI analysis on [SYMBOL] before your next trade? Try Metis →"
- On dashboard: subtle "Powered by Metis" badge
- In README: "Get AI-powered stock analysis with Metis Cloud"
- Share card watermark: "hisaab.dev | Powered by Metis"
- Contextual, non-intrusive — only at natural upgrade moments

**P4.3 — Tax Report Generation**
- Scrip-wise STCG/LTCG computation
- Holding period classification (short-term vs long-term)
- Rs 1.25 lakh LTCG exemption tracking
- Format compatible with ITR-2/ITR-3 Schedule CG
- STT tracking (deductible for business income)
- Export as CSV for CA upload

**P4.4 — PWA & Offline Support**
- Service worker for offline access
- Install prompt ("Add to Home Screen")
- Offline-first: all features work without internet
- Background sync when online (for future cloud features)

#### Acceptance Criteria (Phase 4)
- [ ] AI nudges generate relevant insights from trade data
- [ ] Metis CTAs appear at contextual moments, not randomly
- [ ] Tax report matches manual CA calculation for test dataset
- [ ] PWA installs correctly on Android Chrome and iOS Safari
- [ ] App works fully offline after first load

---

## 7. Out of Scope (MVP)

- Landing page / marketing site (not in MVP)
- User authentication / accounts
- Server-side database
- Real-time market data / live prices
- Broker API auto-sync (OAuth)
- Social features (leaderboards, sharing portfolios)
- Options Greeks / OI analytics
- Multi-currency support
- Hindi / regional language support (future)
- Native mobile app (iOS/Android)

---

## 8. Competitive Differentiation

| Feature | Hisaab | TradesViz | Zerodha Console | Google Sheets |
|---------|--------|-----------|-----------------|---------------|
| **Price** | Free forever | Free/$20-29/mo | Free (Zerodha only) | Free |
| **Signup required** | No | Yes | Yes (Zerodha account) | Yes (Google) |
| **Open source** | Yes (MIT) | No | No | N/A |
| **Data privacy** | 100% local | Cloud-stored | Cloud-stored | Cloud-stored |
| **Multi-broker** | Yes (4+) | Yes (100+) | Zerodha only | Manual |
| **FIFO matching** | Automatic | Automatic | None | Manual |
| **Win rate** | Instant | After setup | None | Manual formula |
| **AI insights** | Phase 4 | No | No | No |
| **Tax reports** | Phase 4 | No | No | Manual |
| **Mobile-friendly** | PWA | Web + App | Web | Web + App |
| **F&O support** | Phase 1 | Paid only | Basic | Manual |
| **Self-hosted** | Yes | No | No | N/A |

---

## 9. Success Metrics

### Phase 1 (Launch)
- 100+ GitHub stars within first month
- 500+ unique users uploading CSV in first month
- <5 second time from upload to dashboard
- <3% parse error rate on Zerodha CSVs

### Phase 2 (Retention)
- 30% of users return within 7 days
- 15% of users add notes/tags to trades
- Average 3+ sessions per user in first month

### Phase 3 (Growth)
- 500+ GitHub stars
- Featured on r/IndianStreetBets or Indian FinTwit
- 5+ community contributions (PRs)

### Phase 4 (Funnel)
- 10% click-through on Metis CTAs
- 5% conversion from Hisaab user → Metis signup
- Product Hunt launch (Top 5 of the day target)

---

## 10. Tech Stack Summary

```
Framework:     Next.js 15 (App Router, TypeScript, static export)
UI:            Tailwind CSS 4 + shadcn/ui
Charts:        Recharts
File Parsing:  Papa Parse (CSV) + SheetJS (XLSX)
Storage:       IndexedDB via Dexie.js
PWA:           next-pwa / Serwist
Deployment:    Vercel (primary), GitHub Pages (alternative)
License:       MIT
```

---

## 11. Folder Structure (Proposed)

```
hisaab/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Upload/drop zone (entry point)
│   ├── dashboard/
│   │   └── page.tsx            # Main P&L dashboard
│   ├── journal/
│   │   └── page.tsx            # Trade table with notes/tags
│   ├── analytics/
│   │   └── page.tsx            # Advanced analytics (Phase 3)
│   ├── calendar/
│   │   └── page.tsx            # Calendar heatmap (Phase 2)
│   └── demo/
│       └── page.tsx            # Demo with sample data
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── upload/
│   │   ├── drop-zone.tsx
│   │   ├── broker-selector.tsx
│   │   └── parse-progress.tsx
│   ├── dashboard/
│   │   ├── kpi-cards.tsx
│   │   ├── pnl-curve.tsx
│   │   ├── monthly-bars.tsx
│   │   └── trade-table.tsx
│   ├── journal/
│   │   ├── trade-row.tsx
│   │   ├── note-editor.tsx
│   │   └── tag-picker.tsx
│   └── analytics/
│       ├── day-of-week.tsx
│       ├── monte-carlo.tsx
│       └── risk-metrics.tsx
├── lib/
│   ├── parsers/
│   │   ├── zerodha.ts          # Zerodha CSV parser
│   │   ├── groww.ts            # Groww XLSX parser
│   │   ├── upstox.ts           # Upstox CSV parser (Phase 3)
│   │   ├── angel.ts            # Angel One parser (Phase 3)
│   │   └── detect-broker.ts    # Auto-detect broker from file
│   ├── matching/
│   │   └── fifo.ts             # FIFO trade matching engine
│   ├── analytics/
│   │   ├── basic.ts            # KPIs, win rate, profit factor
│   │   ├── advanced.ts         # Monte Carlo, Kelly, drawdown
│   │   └── behavioral.ts       # Day-of-week, holding period
│   ├── storage/
│   │   └── db.ts               # Dexie.js IndexedDB setup
│   ├── types.ts                # Shared TypeScript types
│   └── utils.ts                # INR formatting, date helpers
├── .pm/
│   └── research/               # Market research docs
├── public/
│   ├── demo-data/              # Sample CSV for demo mode
│   └── manifest.json           # PWA manifest
├── README.md
├── LICENSE                     # MIT
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Broker changes CSV format | Parsing breaks | Version parsers, test against real files, community reports |
| IndexedDB storage limits | Data loss for heavy traders | Warn at 80% capacity, offer JSON export |
| Cannibalize Metis signups | Strategic misalignment | Clear separation: Hisaab = backward-looking, Metis = forward-looking AI |
| Low GitHub traction | No funnel value | README-first development, demo GIF, launch strategy |
| FIFO matching bugs | Wrong P&L → trust destroyed | Extensive test suite against known broker outputs |
| SEBI regulatory changes | Tax calculations outdated | Version tax rates, document FY applicability |

---

## 13. Launch Strategy

1. **Pre-launch (Week -2 to 0):** Polish README with hero GIF, comparison table, quick start. Seed 50 stars from network.
2. **Soft launch (Week 1):** Post on r/IndianStreetBets, r/IndianStockMarket, TradingQ&A. Share on Indian FinTwit.
3. **Product Hunt (Week 2-3):** Tuesday launch, target "Developer Tools" + "Fintech" categories.
4. **Hacker News (Week 3):** "Show HN: Open source trading journal for Indian traders — no signup, runs in browser"
5. **Ongoing:** Community contributions, broker parser PRs, content marketing via Metis blog.

---

## 14. Relationship to Metis

```
                     Hisaab (This Project)
                     ─────────────────────
                     "What happened?"
                     Post-trade analysis
                     Free, open source
                     Browser-only, no auth
                            │
                            │  "Want to make better decisions?"
                            │  Contextual CTAs at insight moments
                            ▼
                     Metis (Paid Product)
                     ────────────────────
                     "What should I do next?"
                     Pre-trade AI analysis
                     Paid, cloud-hosted
                     Full auth + persistence
```

The funnel works because:
- Hisaab shows traders their **problems** (low win rate, revenge trading, poor R:R)
- Metis offers the **solution** (AI-powered stock analysis for better entry/exit decisions)
- The upgrade moment is natural, not forced

---

## Sources

- [SEBI F&O Trader Study FY25](https://www.sebi.gov.in/media-and-notifications/press-releases/sep-2024/)
- See `.pm/research/` for full market research, user research, funnel strategy, and broker CSV format docs
