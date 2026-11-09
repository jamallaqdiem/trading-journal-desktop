export type TradeAction = "BUY" | "SELL";
export type ExitType = "TP" | "SL" | "MANUAL" | "TRAILING_STOP" | "EOD";

export interface Trade {
  id: number;
  ticker: string;
  action: "BUY" | "SELL";
  shares: number;
  entry_price: number;
  exit_price?: number | null;
  entry_date: string;
  exit_date?: string | null;
  exit_reason: string | null;
  holding_period_minutes?: number | null;
  realized_pnl?: number | null;
  commission?: number | null;
  notes?: string | null;
  screenshot_path?: string | null;
  type?: "LONG" | "SHORT";
  exit_type?: ExitType | null;
  exchange: string | "SMART";
}

export interface NewTradePayload {
  ticker: string;
  action: TradeAction;
  shares: number;
  entry_price: number;
  entry_date: string;
  exit_price?: number | null;
  exit_reason: string | null;
  holding_period_minutes?: number | null;
  realized_pnl?: number | null;
  exit_type?: ExitType | null;
  commission?: number | null;
  notes?: string | null;
  screenshot_path?: string | null;
}

export interface MarketNews {
  id: number;
  date: string;
  ticker: string;
  headline: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  source: string;
  url: string;
  created_at?: string;
}

export interface DailyJournal {
  id: number;
  date: string;
  market_bias: "Bullish" | "Bearish" | "Neutral";
  psychology_rating: number;
  notes: string;
  created_at?: string;
}

export interface DailyDataPoint {
  dateStr: string;
  displayDate: string;
  pnl: number;
  totalTrades: number;
  winRate: number;
  bestTrade: string;
  worstTrade: string;
  avgDuration: string;
}

export type ActiveTab = "overview" | "trades" | "news" | "journal";
