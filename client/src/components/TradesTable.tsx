import React, { useState, useMemo } from "react";
import {
  User,
  Clock,
  Target,
  ShieldAlert,
  Sliders,
  Timer,
  Calendar,
} from "lucide-react";
import type { Trade, ExitType } from "../types";
import { styles } from "../styles/classes";

interface TradesTableProps {
  trades: Trade[];
  loading: boolean;
  onUpdateTrade: (id: number, fields: Partial<Trade>) => void;
}

type DateFilterType =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "ALL";

const formatDuration = (minutes?: number | null) => {
  if (minutes === null || minutes === undefined) {
    return (
      <span className="text-slate-500 flex items-center gap-1 text-xs">
        <Clock className="w-3 h-3" /> Active
      </span>
    );
  }

  const totalSeconds = Math.round(minutes * 60);
  const days = Math.floor(totalSeconds / 86400);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (days > 0) return `${days}d ${hrs}h ${mins}m ${secs}s`;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const renderExitBadge = (exitType?: ExitType | null, isClosed?: boolean) => {
  if (!isClosed) {
    return <span className="text-slate-500 text-xs">-</span>;
  }

  switch (exitType) {
    case "TP":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          title="Take Profit Target Hit"
        >
          <Target className="w-3 h-3" /> TP Hit
        </span>
      );
    case "SL":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"
          title="Stop Loss Triggered"
        >
          <ShieldAlert className="w-3 h-3" /> Stop Loss
        </span>
      );
    case "TRAILING_STOP":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"
          title="Trailing Stop Triggered"
        >
          <Sliders className="w-3 h-3" /> Trailing
        </span>
      );
    case "EOD":
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20"
          title="End of Day Auto Exit"
        >
          <Timer className="w-3 h-3" /> EOD
        </span>
      );
    case "MANUAL":
    default:
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20"
          title="Manual Discretionary Close"
        >
          <User className="w-3 h-3" /> Manual
        </span>
      );
  }
};

export const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  loading,
  onUpdateTrade,
}) => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>("TODAY");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredTrades = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return trades.filter((trade) => {
      const tradeDate = new Date(trade.entry_date);

      let matchesTime;
      switch (dateFilter) {
        case "TODAY":
          matchesTime = tradeDate >= startOfToday;
          break;
        case "YESTERDAY":
          matchesTime =
            tradeDate >= startOfYesterday && tradeDate < startOfToday;
          break;
        case "THIS_WEEK":
          matchesTime = tradeDate >= startOfWeek;
          break;
        case "THIS_MONTH":
          matchesTime = tradeDate >= startOfMonth;
          break;
        case "ALL":
        default:
          matchesTime = true;
      }

      const matchesSearch =
        !searchTerm.trim() ||
        trade.ticker.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesTime && matchesSearch;
    });
  }, [trades, dateFilter, searchTerm]);

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-400">
        Loading trades from PostgreSQL...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeframe & Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151921] p-3 rounded-xl border border-[#2A303F]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar className="w-4 h-4 text-emerald-400 mr-1 hidden sm:block" />
          {(
            [
              "TODAY",
              "YESTERDAY",
              "THIS_WEEK",
              "THIS_MONTH",
              "ALL",
            ] as DateFilterType[]
          ).map((filter) => {
            const labels: Record<DateFilterType, string> = {
              TODAY: "Today",
              YESTERDAY: "Yesterday",
              THIS_WEEK: "This Week",
              THIS_MONTH: "This Month",
              ALL: "All Time",
            };

            const isActive = dateFilter === filter;

            return (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-[#1E2330]"
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Filter by Ticker (e.g. TSLA)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input + " text-xs py-1.5 sm:w-60"}
          />
          <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
            {filteredTrades.length}{" "}
            {filteredTrades.length === 1 ? "trade" : "trades"}
          </span>
        </div>
      </div>

      {/* Trades Table */}
      {filteredTrades.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-[#151921] rounded-xl border border-[#2A303F]">
          No trades found for this period.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#2A303F]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={styles.tableHeader}>Date</th>
                <th className={styles.tableHeader}>Ticker</th>
                <th className={styles.tableHeader}>Action</th>
                <th className={styles.tableHeader}>Shares</th>
                <th className={styles.tableHeader}>Entry Price</th>
                <th className={styles.tableHeader}>Exit Price</th>
                <th className={styles.tableHeader}>Exit Type</th>
                <th className={styles.tableHeader}>Entry/Exit Reason</th>
                <th className={styles.tableHeader}>Holding Time</th>
                <th className={styles.tableHeader}>Exchange</th>
                <th className={styles.tableHeader}>Realized PnL</th>
                <th className={styles.tableHeader}>Commission</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((t) => {
                const pnl = t.realized_pnl ? Number(t.realized_pnl) : null;
                const isClosed = Boolean(t.exit_price);

                return (
                  <tr key={t.id} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div className="flex flex-col">
                        <span>
                          {new Date(t.entry_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(t.entry_date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </td>

                    <td className={`${styles.tableCell} font-bold text-white`}>
                      {t.ticker}
                    </td>

                    <td className={styles.tableCell}>
                      <span
                        className={
                          t.action === "BUY"
                            ? styles.badgeBuy
                            : styles.badgeSell
                        }
                      >
                        {t.action}
                      </span>
                    </td>

                    <td className={styles.tableCell}>{t.shares}</td>

                    <td className={styles.tableCell}>
                      ${Number(t.entry_price).toFixed(2)}
                    </td>

                    <td className={styles.tableCell}>
                      {t.exit_price ? (
                        `$${Number(t.exit_price).toFixed(2)}`
                      ) : (
                        <span className="text-slate-500">Open</span>
                      )}
                    </td>

                    <td className={styles.tableCell}>
                      {renderExitBadge(t.exit_type, isClosed)}
                    </td>
                    {/* Custom Exit Reason Text area Column */}
                    <td className={styles.tableCell}>
                      <textarea
                        defaultValue={t.exit_reason || ""}
                        placeholder="Add reason..."
                        rows={2}
                        className="bg-[#0b0e14] border border-[#2A303F] text-slate-200 text-xs rounded px-2 py-1 w-36 focus:outline-none focus:border-emerald-500 resize-none whitespace-pre-wrap break-words min-h-[36px]"
                        onBlur={async (e) => {
                          const newReason = e.target.value;
                          // check if there is any change in the text before sending a PATCH
                          if (newReason === t.exit_reason) return;
                          onUpdateTrade(t.id, { exit_reason: newReason });
                        }}
                      />
                    </td>

                    <td
                      className={`${styles.tableCell} font-mono text-xm text-slate-300`}
                    >
                      {formatDuration(t.holding_period_minutes)}
                    </td>

                    <td className={styles.tableCell}>
                      <span className="text-slate-300 font-medium">
                        {t.exchange || "SMART"}
                      </span>
                    </td>

                    <td
                      className={`${styles.tableCell} font-mono font-semibold`}
                    >
                      {pnl === null ? (
                        <span className="text-slate-500">-</span>
                      ) : pnl >= 0 ? (
                        <span className="text-emerald-400">
                          +${pnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-rose-400">
                          -${Math.abs(pnl).toFixed(2)}
                        </span>
                      )}
                    </td>
                    {/* Commissions*/}
                    <td
                      className={`${styles.tableCell} font-mono text-slate-300`}
                    >
                      {t.commission !== null && t.commission !== undefined
                        ? `$${Number(t.commission).toFixed(2)}`
                        : "$0.00"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
