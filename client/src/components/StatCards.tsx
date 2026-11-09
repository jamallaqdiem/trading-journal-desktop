import React from "react";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import type { Trade } from "../types";
import { styles } from "../styles/classes";

interface StatCardsProps {
  trades: Trade[];
}

export const StatCards: React.FC<StatCardsProps> = ({ trades }) => {
  const totalTrades = trades.length;

  const closedTrades = trades.filter(
    (t) => t.realized_pnl !== null && t.realized_pnl !== undefined,
  );
  const winningTrades = closedTrades.filter((t) => Number(t.realized_pnl) > 0);

  const winRate =
    closedTrades.length > 0
      ? ((winningTrades.length / closedTrades.length) * 100).toFixed(1)
      : "0.0";

  const totalPnL = closedTrades.reduce(
    (acc, t) => acc + Number(t.realized_pnl || 0),
    0,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className={styles.card}>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase">
            Total Trades
          </span>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-white mt-2">{totalTrades}</p>
      </div>

      <div className={styles.card}>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase">
            Win Rate
          </span>
          <Target className="w-4 h-4 text-cyan-400" />
        </div>
        <p className="text-2xl font-bold text-white mt-2">{winRate}%</p>
      </div>

      <div className={styles.card}>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase">
            Total Realized PnL
          </span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <p
          className={`text-2xl font-bold mt-2 font-mono ${totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}
        >
          {totalPnL >= 0
            ? `+$${totalPnL.toFixed(2)}`
            : `-$${Math.abs(totalPnL).toFixed(2)}`}
        </p>
      </div>

      <div className={styles.card}>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs font-medium uppercase">
            Closed Positions
          </span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl font-bold text-white mt-2">
          {closedTrades.length}
        </p>
      </div>
    </div>
  );
};
