# Contributing to Hisaab

Thanks for wanting to contribute. This guide will get you from zero to your first PR.

## Table of Contents

- [Quick Start](#quick-start)
- [Before You Start](#before-you-start)
- [Project Structure](#project-structure)
- [What to Contribute](#what-to-contribute)
- [Development Guidelines](#development-guidelines)
- [House Rules](#house-rules)
- [Submitting a PR](#submitting-a-pr)
- [First Time Contributing?](#first-time-contributing-to-open-source)

## Quick Start

```bash
git clone https://github.com/Devansh-365/hisaab.git
cd hisaab
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). Drop a sample CSV from `public/demo-data/` to test.

## Before You Start

- Read the [Code of Conduct](CODE_OF_CONDUCT.md)
- Check [existing issues](https://github.com/Devansh-365/hisaab/issues) to avoid duplicates
- For new features, **open an issue first** to discuss the approach before writing code
- For bug fixes and small improvements, feel free to go straight to a PR

## Project Structure

```
app/                 Pages (dashboard, journal, calendar, analytics, demo)
components/
  ui/                shadcn/ui primitives (don't edit directly)
  dashboard/         KPI cards, charts, trade table
  journal/           Annotations, tags, star rating, manual entry
  analytics/         Advanced metrics, drawdown, day-of-week, tax
  calendar/          Heatmap
  layout/            PageHeader, BottomNav, EmptyState, PageLoading
  upload/            DropZone
  metis/             Metis CTA components
  brokers/           Broker logo SVGs
lib/
  parsers/           Broker CSV/XLSX parsers + auto-detection
  matching/          FIFO trade matching engine
  analytics/         KPI computation, behavioral, advanced, tax, journal
  storage/           Dexie.js IndexedDB schema
  utils/             INR formatting, FY helpers, date parsing, export
hooks/               use-trades, use-debounce
public/demo-data/    Sample broker CSV files for testing
```

## What to Contribute

### High Impact

**Broker parsers.** This is the single most valuable contribution. Every new broker parser unlocks thousands of potential users who couldn't use Hisaab before.

How to add one:
1. Export a tradebook from the broker (CSV or XLSX)
2. Note the column headers
3. Create `lib/parsers/your-broker.ts` following the pattern below
4. Add header signatures to `lib/parsers/detect-broker.ts`
5. Wire it into `lib/parsers/index.ts`
6. Add a sample CSV to `public/demo-data/`
7. Submit a PR

**Parser template:**

```typescript
// lib/parsers/your-broker.ts
import Papa from "papaparse";
import { ulid } from "ulid";
import type { TradeRecord, ParseResult, ParseError } from "@/lib/types";
import { parseTradeDate } from "@/lib/utils/dates";
import { getFY } from "@/lib/utils/fy";

export function parseYourBroker(
  csvText: string,
  fileName: string,
  importId: string
): ParseResult {
  const errors: ParseError[] = [];
  const trades: TradeRecord[] = [];
  const now = new Date().toISOString();

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
  });

  for (let i = 0; i < parsed.data.length; i++) {
    const row = parsed.data[i];
    // Map your broker's columns to TradeRecord fields
    // Push errors for invalid rows, trades for valid ones
  }

  return {
    trades,
    errors,
    meta: {
      broker: "your-broker",
      fileName,
      totalRows: parsed.data.length,
      parsedRows: trades.length,
      skippedRows: errors.length,
      dateRange: null,
    },
  };
}
```

### Also Welcome

- Bug fixes (especially FIFO matching edge cases)
- Accessibility improvements
- Performance optimization for large trade datasets (10K+ trades)
- Better mobile responsiveness
- New analytics/chart types

### Not Looking For

- Backend/server features (Hisaab is intentionally client-only)
- Authentication/user accounts
- Features that require network requests with trade data
- Style-only changes without functional improvement

## Development Guidelines

### Code Style

- TypeScript strict mode. `npx tsc --noEmit` must pass with zero errors
- Use shadcn/ui components where possible
- Use Lucide icons, not emojis
- No em dashes in any copy or comments
- Prefer `useEffect` for side effects, never `setState` inside `useMemo`

### Commits

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Keep commits focused on a single change
- Write commit messages that explain why, not just what

### Testing Your Changes

```bash
# Type check
npx tsc --noEmit

# Build (must complete with zero errors)
npm run build

# Test with sample files
# Drop files from public/demo-data/ into the upload zone
```

### Key Architecture Rules

1. **No network requests with user data.** Everything stays in the browser.
2. **Analytics are computed, not stored.** Derive from matched trades at render time.
3. **Dedup on import.** Use compound index `[broker+tradeId+tradeDate]` to skip duplicates.
4. **Distinguish loading from empty.** Use `useMatchedTradesWithLoading()`, not `useMatchedTrades()`, in pages that show empty states.

## House Rules

These keep the project healthy and reviews fast. Inspired by [Cal.com's contribution guide](https://github.com/calcom/cal.com/blob/main/CONTRIBUTING.md).

### Before You Code

- **Check for duplicates.** Search open issues and PRs before starting work.
- **Get approval for features.** Open an issue, describe the problem, and wait for a maintainer response before building.
- **Claim the issue.** Comment on an issue to let others know you're working on it.

### Writing Your PR

- **Keep PRs small.** Under 400 lines changed and under 10 files modified is ideal. Split large changes into stacked PRs.
- **Think like a reviewer.** What would someone unfamiliar with this change need to know?
- **Link the issue.** Use `Closes #123` in the PR description so it auto-closes when merged.
- **Show your work.** For UI changes, include a screenshot or short video.
- **Describe what you tested.** Which broker files, which pages, which edge cases.

### Code Quality

- No `console.log` left in committed code
- No commented-out code blocks
- No `any` types unless absolutely unavoidable (and commented why)
- Prefer composition over abstraction for one-off logic

## Submitting a PR

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Verify: `npx tsc --noEmit && npm run build`
4. Open a PR with a clear description of what and why
5. Fill out the PR template checklist
6. Wait for review. We aim to respond within a few days.

## First Time Contributing to Open Source?

Look for issues labeled [`good first issue`](https://github.com/Devansh-365/hisaab/labels/good%20first%20issue). These are scoped, well-defined tasks that don't require deep knowledge of the codebase.

If you're stuck, open a draft PR and ask for help. We'd rather help you finish than see you give up.

## Questions?

Use [GitHub Discussions](https://github.com/Devansh-365/hisaab/discussions) for questions about the codebase or contribution process. Issues are for bugs and feature requests only.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
