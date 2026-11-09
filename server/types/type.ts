// --- Database Entity Interfaces ---

export interface Trade {
  id?: number;
  ticker: string;
  action: "BUY" | "SELL";
  shares: number;
  entry_price: number;
  exit_price?: number | null;
  entry_date: Date | string;
  exit_date?: Date | string | null;
  holding_period_minutes?: number | null;
  realized_pnl?: number | null;
  commission?: number;
  exit_reason?: string | null;
  notes?: string | null;
  screenshot_path?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface MarketNews {
  id?: number;
  date: Date | string;
  ticker?: string | null;
  headline: string;
  summary?: string | null;
  sentiment?: "BULLISH" | "BEARISH" | "NEUTRAL" | null;
  source?: string | null;
  url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface DailyJournal {
  id?: number;
  date: Date | string;
  market_bias?: "Bullish" | "Bearish" | "Choppy" | null;
  psychology_rating?: number | null;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Extension of Knex interface for type-safe queries
declare module "knex" {
  namespace Knex {
    interface Tables {
      trades: Trade;
      market_news: MarketNews;
      daily_journal: DailyJournal;
    }
  }
}
