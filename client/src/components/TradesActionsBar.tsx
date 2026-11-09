import React from "react";
import { Download, Upload } from "lucide-react";
import type { Trade } from "../types";
import { exportTradesToCSV, parseTradesCSV } from "../utils/csv";
import { tradesApi } from "../api/axiosClient";

interface TradesActionsBarProps {
  trades: Trade[];
  onRefresh: () => void;
}

export const TradesActionsBar: React.FC<TradesActionsBarProps> = ({
  trades,
  onRefresh,
}) => {
  const handleExport = () => {
    exportTradesToCSV(trades);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsedTrades = parseTradesCSV(text);

        if (parsedTrades.length === 0) {
          alert("No valid trade rows found in CSV file.");
          return;
        }

        // Send each imported trade to Express backend / SQLite database
        for (const trade of parsedTrades) {
          await tradesApi.create(trade);
        }

        alert(
          `Successfully imported ${parsedTrades.length} trades into database!`,
        );
        onRefresh(); // Refresh trade list from SQLite
      } catch (err) {
        console.error("CSV Import Error:", err);
        alert("Failed to import CSV trades.");
      } finally {
        // Reset file input
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center justify-between bg-[#151921] p-3 rounded-xl border border-[#2A303F]">
      <div className="text-xs text-slate-400 font-mono">
        Showing filtered trades ({trades.length})
      </div>

      <div className="flex items-center gap-2">
        {/* Export Button */}
        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1E2330] text-slate-300 hover:text-white hover:bg-slate-700 border border-[#2A303F] flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
        </button>

        {/* Import Button */}
        <label className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1E2330] text-slate-300 hover:text-white hover:bg-slate-700 border border-[#2A303F] flex items-center gap-1.5 transition-all cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-sky-400" /> Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
