// Shared TypeScript types for Hisaab

export type Broker = "zerodha" | "groww" | "upstox" | "angel" | "manual";
export type Exchange = "NSE" | "BSE";
export type Segment = "EQ" | "FO" | "CD";
export type TradeType = "BUY" | "SELL";
export type TradeDirection = "LONG" | "SHORT";
export type TradeStatus = "CLOSED" | "OPEN";

export interface TradeRecord {
  id: string;
  broker: Broker;
  symbol: string;
  isin?: string;
  exchange: Exchange;
  segment: Segment;
  tradeType: TradeType;
  quantity: number;
  price: number;
  amount: number; // quantity * price
  tradeDate: string; // ISO 8601
  executionTime?: string;
  orderId?: string;
  tradeId?: string;
  importId: string;
  importedAt: string;
  financialYear: string; // e.g., "FY2025-26"
}

export interface MatchedTradeRecord {
  id: string;
  symbol: string;
  segment: Segment;
  direction: TradeDirection;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  holdingDays: number;
  status: TradeStatus;
  financialYear: string;
  entryTradeIds: string[];
  exitTradeIds: string[];
  // Phase 2 — annotations
  notes?: string;
  tags?: string[];
  emotion?: string;
  rating?: number;
}

export interface ImportRecord {
  id: string;
  fileName: string;
  broker: string;
  tradeCount: number;
  importedAt: string;
  errors: number;
}

export interface ParseError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface ParseResult {
  trades: TradeRecord[];
  errors: ParseError[];
  meta: {
    broker: string;
    fileName: string;
    totalRows: number;
    parsedRows: number;
    skippedRows: number;
    dateRange: { from: string; to: string } | null;
  };
}

export interface DashboardKPIs {
  netPnl: number;
  totalTrades: number;
  winners: number;
  losers: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: MatchedTradeRecord | null;
  worstTrade: MatchedTradeRecord | null;
  avgHoldingDays: number;
  openPositions: number;
}

export interface MonthlyPnl {
  month: string; // "2025-04"
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
}

export interface StrategyBreakdown {
  tag: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  pnl: number;
  avgPnl: number;
}

export interface DailyPnl {
  date: string; // "2025-04-15"
  pnl: number;
  trades: number;
  isAnnotated: boolean;
}

export interface JournalingStreak {
  current: number;
  longest: number;
  lastAnnotatedDate: string | null;
}

export const STRATEGY_TAGS = [
  "breakout",
  "mean reversion",
  "momentum",
  "earnings play",
  "gap fill",
  "trend following",
  "scalp",
  "swing",
  "positional",
  "news based",
] as const;

export const EMOTION_TAGS = [
  "disciplined",
  "fomo",
  "revenge",
  "fear",
  "greed",
  "patient",
  "impulsive",
] as const;

export interface CumulativePnlPoint {
  date: string;
  pnl: number;
  cumulative: number;
}
