import React, { useState, useMemo } from "react";
import {
  Activity,
  Target,
  ShieldAlert,
  UserCheck,
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  Percent,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { Trade } from "../types";

interface OverviewProps {
  trades: Trade[];
}

type DateFilterType =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "ALL";

export const OverviewAnalyticsView: React.FC<OverviewProps> = ({ trades }) => {
  const [dateFilter, setDateFilter] = useState<DateFilterType>("TODAY");

  // Filter trades based on selected timeframe using entry_date
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

      switch (dateFilter) {
        case "TODAY":
          return tradeDate >= startOfToday;
        case "YESTERDAY":
          return tradeDate >= startOfYesterday && tradeDate < startOfToday;
        case "THIS_WEEK":
          return tradeDate >= startOfWeek;
        case "THIS_MONTH":
          return tradeDate >= startOfMonth;
        case "ALL":
        default:
          return true;
      }
    });
  }, [trades, dateFilter]);

  //  Metrics & Dynamic Date Sequence Generator
  const metrics = useMemo(() => {
    const totalTrades = filteredTrades.length;

    let wins = 0;
    let winSum = 0;
    let winCount = 0;
    let lossSum = 0;
    let lossCount = 0;
    let netPnl = 0;
    let longsCount = 0;
    let shortsCount = 0;

    const exitTypes = { TP: 0, SL: 0, MANUAL: 0, TRAILING: 0, EOD: 0 };
    const tradeDailyMap: Record<string, number> = {};

    // Peak-to-Trough Drawdown calculation
    let peak = 0;
    let currentEquity = 0;
    let maxDrawdownDollars = 0;
    const drawdownDataPoints: { stage: string; val: number }[] = [
      { stage: "Start", val: 0 },
    ];

    filteredTrades.forEach((t, idx) => {
      const pnl = Number(t.realized_pnl) || 0;
      netPnl += pnl;

      if (pnl > 0) {
        wins++;
        winSum += pnl;
        winCount++;
      } else if (pnl < 0) {
        lossSum += Math.abs(pnl);
        lossCount++;
      }

      if (t.type?.toUpperCase() === "LONG" || t.action?.toUpperCase() === "BUY")
        longsCount++;
      if (
        t.type?.toUpperCase() === "SHORT" ||
        t.action?.toUpperCase() === "SELL"
      )
        shortsCount++;

      const exit = t.exit_type?.toUpperCase();
      if (exit === "TP" || exit === "TARGET") exitTypes.TP++;
      else if (exit === "SL" || exit === "STOP_LOSS") exitTypes.SL++;
      else if (exit === "MANUAL") exitTypes.MANUAL++;
      else if (exit === "TRAILING") exitTypes.TRAILING++;
      else if (exit === "EOD") exitTypes.EOD++;

      // Equity curve
      currentEquity += pnl;
      if (currentEquity > peak) peak = currentEquity;
      const drawdown = currentEquity - peak;
      if (drawdown < maxDrawdownDollars) maxDrawdownDollars = drawdown;

      drawdownDataPoints.push({
        stage: `T${idx + 1}`,
        val: drawdown,
      });

      // Group trade PnL by Date String
      const dateKey = new Date(t.entry_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      tradeDailyMap[dateKey] = (tradeDailyMap[dateKey] || 0) + pnl;
    });

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const winAvg = winCount > 0 ? winSum / winCount : 0;
    const lossAvg = lossCount > 0 ? lossSum / lossCount : 0;
    const profitFactor =
      lossSum > 0 ? winSum / lossSum : winSum > 0 ? winSum : 0;

    // --- BUILD CONTINUOUS DATE RANGE FOR THE CHART ---
    const now = new Date();
    const chartData: { date: string; pnl: number }[] = [];

    if (dateFilter === "TODAY") {
      const todayStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      chartData.push({ date: todayStr, pnl: tradeDailyMap[todayStr] || 0 });
    } else if (dateFilter === "YESTERDAY") {
      const yest = new Date(now);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
      chartData.push({ date: yestStr, pnl: tradeDailyMap[yestStr] || 0 });
    } else if (dateFilter === "THIS_WEEK") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        });
        chartData.push({ date: dateStr, pnl: tradeDailyMap[dateStr] || 0 });
      }
    } else if (dateFilter === "THIS_MONTH") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentDate = new Date(startOfMonth);

      while (currentDate <= now) {
        const dateStr = currentDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        });
        chartData.push({ date: dateStr, pnl: tradeDailyMap[dateStr] || 0 });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      const allKeys = Object.keys(tradeDailyMap);
      if (allKeys.length === 0) {
        const todayStr = now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        });
        chartData.push({ date: todayStr, pnl: 0 });
      } else {
        allKeys.forEach((key) => {
          chartData.push({ date: key, pnl: tradeDailyMap[key] });
        });
      }
    }

    return {
      totalTrades,
      winRate,
      netPnl,
      winAvg,
      lossAvg,
      profitFactor,
      longsCount,
      shortsCount,
      maxDrawdownDollars,
      drawdownData: drawdownDataPoints,
      exitTypes,
      chartData,
    };
  }, [filteredTrades, dateFilter]);

  const maxBarValue = Math.max(
    ...metrics.chartData.map((d) => Math.abs(d.pnl)),
    600,
  );

  return (
    <div className="space-y-6">
      {/* Timeframe Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#151921]/90 backdrop-blur-xl p-3.5 rounded-2xl border border-slate-800/80 shadow-lg">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Calendar className="w-4 h-4 text-emerald-400 mr-1.5 hidden sm:block" />
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#1E2330]"
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 font-mono px-2 py-1 rounded-lg bg-[#1E2330]/60 border border-slate-800">
          {filteredTrades.length}{" "}
          {filteredTrades.length === 1 ? "trade" : "trades"} logged
        </span>
      </div>

      {/* Unified Top KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net P&L Card */}
        <div className="bg-[#151921]/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Period Net P&L</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-xl font-bold font-mono tracking-tight ${
                metrics.netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {metrics.netPnl >= 0 ? "+" : "-"}$
              {Math.abs(metrics.netPnl).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="bg-[#151921]/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Win Rate</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {metrics.winRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">
              {metrics.totalTrades} total
            </span>
          </div>
        </div>

        {/* Profit Factor Card */}
        <div className="bg-[#151921]/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Profit Factor</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {metrics.profitFactor === Infinity
                ? "∞"
                : metrics.profitFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Total Trades Card */}
        <div className="bg-[#151921]/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Long / Short Ratio</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-white tracking-tight">
              {metrics.longsCount}L / {metrics.shortsCount}S
            </span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Averages, Exits, Drawdown & Distribution */}
        <div className="space-y-6">
          {/* Win / Loss Averages */}
          <div className="bg-[#151921]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-xl">
            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Win Avg</span>
                <span className="text-emerald-400 font-bold font-mono">
                  +${metrics.winAvg.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#1E2330] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min((metrics.winAvg / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                <span>Loss Avg</span>
                <span className="text-rose-400 font-bold font-mono">
                  -${metrics.lossAvg.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-[#1E2330] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min((metrics.lossAvg / 1000) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Execution Exit Types */}
          <div className="bg-[#151921]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Execution Exit Types
            </h3>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#1E2330]/60 border border-slate-800/60">
              <span className="flex items-center gap-2 text-emerald-400">
                <Target className="w-3.5 h-3.5" /> Target Hit (TP)
              </span>
              <span className="font-mono font-bold text-white">
                {metrics.exitTypes.TP}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#1E2330]/60 border border-slate-800/60">
              <span className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" /> Stop Loss (SL)
              </span>
              <span className="font-mono font-bold text-white">
                {metrics.exitTypes.SL}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#1E2330]/60 border border-slate-800/60">
              <span className="flex items-center gap-2 text-slate-300">
                <UserCheck className="w-3.5 h-3.5" /> Manual Exit
              </span>
              <span className="font-mono font-bold text-white">
                {metrics.exitTypes.MANUAL}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#1E2330]/60 border border-slate-800/60">
              <span className="flex items-center gap-2 text-amber-400">
                <Zap className="w-3.5 h-3.5" /> Trailing Stop
              </span>
              <span className="font-mono font-bold text-white">
                {metrics.exitTypes.TRAILING}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-[#1E2330]/60 border border-slate-800/60">
              <span className="flex items-center gap-2 text-purple-400">
                <Clock className="w-3.5 h-3.5" /> End of Day (EOD)
              </span>
              <span className="font-mono font-bold text-white">
                {metrics.exitTypes.EOD}
              </span>
            </div>
          </div>

          {/* Maximum Drawdown Area Chart in Currency ($) */}
          <div className="bg-[#151921]/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-800/80 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-semibold uppercase">
                Maximum Drawdown
              </span>
              <span className="text-xs text-slate-500">
                Peak-to-Trough Decline
              </span>
            </div>

            <div className="flex justify-between items-baseline mt-1 mb-2">
              <span className="text-2xl font-bold font-mono text-rose-400">
                {metrics.maxDrawdownDollars < 0
                  ? `-$${Math.abs(metrics.maxDrawdownDollars).toFixed(2)}`
                  : "$0.00"}
              </span>
              <span className="text-[10px] text-slate-400">
                {metrics.maxDrawdownDollars < 0
                  ? "Max Loss Before Recovery"
                  : "No Active Drawdown"}
              </span>
            </div>

            <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={metrics.drawdownData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="drawdownColor"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.5} />
                      <stop
                        offset="95%"
                        stopColor="#FF3B30"
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="stage" hide />
                  <YAxis hide domain={["dataMin - 50", 10]} />
                  <Tooltip
                    cursor={{
                      stroke: "#FF3B30",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                    contentStyle={{
                      backgroundColor: "#1E232F",
                      borderColor: "#3B4252",
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.8)",
                      padding: "6px 12px",
                    }}
                    labelStyle={{
                      color: "#FFFFFF",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                    itemStyle={{
                      color: "#FF3B30",
                      fontWeight: "bold",
                      fontSize: "13px",
                    }}
                    formatter={(value: unknown) => {
                      const val = Number(value) || 0;
                      return [
                        val < 0
                          ? `-$${Math.abs(val).toFixed(2)}`
                          : `$${val.toFixed(2)}`,
                        "Drawdown P&L",
                      ];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="val"
                    stroke="#FF3B30"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#drawdownColor)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Daily P&L Performance Chart */}
        <div className="lg:col-span-2 bg-[#151921]/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between min-h-[520px] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Daily Net Realized Performance
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                P&L progression for the active timeframe.
              </p>
            </div>
          </div>

          {/* Bar Chart Visualization Area */}
          <div className="flex-1 flex items-end justify-center gap-3 px-2 pb-6 pt-12 border-l border-b border-slate-800 relative overflow-x-auto min-h-[360px]">
            {/* Grid background lines */}
            <div className="absolute inset-x-0 top-0 border-b border-slate-800/60 border-dashed" />
            <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/60 border-dashed" />
            <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/60 border-dashed" />
            <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/60 border-dashed" />

            {metrics.totalTrades === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-300">
                  No trading activity found
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Log your first trade or select a different timeframe to view
                  equity progression.
                </p>
              </div>
            ) : null}

            {metrics.chartData.map((item, idx) => {
              const heightPercent = Math.min(
                (Math.abs(item.pnl) / maxBarValue) * 100,
                100,
              );
              const isPositive = item.pnl >= 0;

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 z-10 group relative flex-1 min-w-[28px] max-w-[90px]"
                >
                  {/* Hover Tooltip */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1E2330] text-white text-[10px] font-mono py-1 px-2 rounded-lg border border-slate-700 whitespace-nowrap shadow-xl z-20">
                    {item.date}: {isPositive ? "+" : "-"}$
                    {Math.abs(item.pnl).toFixed(2)}
                  </div>

                  {/* Bar Container */}
                  <div className="w-full bg-[#1E2330]/40 rounded-t-lg flex items-end h-[280px]">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        item.pnl === 0
                          ? "bg-slate-700/20 h-1"
                          : isPositive
                            ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/15"
                            : "bg-rose-500 hover:bg-rose-400 shadow-lg shadow-rose-500/15"
                      }`}
                      style={{
                        height: item.pnl === 0 ? "2px" : `${heightPercent}%`,
                      }}
                    />
                  </div>

                  {/* Date Axis Label */}
                  <span className="text-[10px] font-mono text-slate-400 mt-2 rotate-[-25px] sm:rotate-0">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
