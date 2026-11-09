import React, { useState } from "react";
import { X } from "lucide-react";
import { tradesApi } from "../api/axiosClient";
import { styles } from "../styles/classes";
import type { TradeAction, ExitType } from "../types";

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [ticker, setTicker] = useState("");
  const [action, setAction] = useState<TradeAction>("BUY");
  const [shares, setShares] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [exitType, setExitType] = useState<ExitType>("MANUAL");
  const [holdingMinutes, setHoldingMinutes] = useState<string>("");
  const [holdingSeconds, setHoldingSeconds] = useState<string>("");
  const [realizedPnl, setRealizedPnl] = useState<string>("");
  const [exitReason, setExitReason] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [commission, setCommission] = useState<string>("");

  if (!isOpen) return null;

  // Function to reset all inputs back to empty/default state
  const handleResetAndClose = () => {
    setTicker("");
    setAction("BUY");
    setShares("");
    setEntryPrice("");
    setExitPrice("");
    setExitType("MANUAL");
    setHoldingMinutes("");
    setHoldingSeconds("");
    setRealizedPnl("");
    setExitReason("");
    setCommission("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      // Calculate total holding period in decimal minutes (Minutes + Seconds/60)
      const totalMinutes =
        holdingMinutes || holdingSeconds
          ? Number(holdingMinutes || 0) + Number(holdingSeconds || 0) / 60
          : null;

      await tradesApi.create({
        ticker: ticker.toUpperCase(),
        action,
        shares: Number(shares),
        entry_price: Number(entryPrice),
        entry_date: new Date().toISOString(),
        exit_reason: exitReason || null,
        exit_price: exitPrice ? Number(exitPrice) : null,
        exit_type: exitPrice ? exitType : null,
        holding_period_minutes: totalMinutes,
        realized_pnl: realizedPnl ? Number(realizedPnl) : null,
        commission: commission ? Number(commission) : null,
      });
      onSuccess();
      handleResetAndClose(); // Clears form and closes modal on success
    } catch (err) {
      console.error("Failed to create trade:", err);
      alert("Error creating trade.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#151921] border border-[#2A303F] rounded-xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          type="button"
          onClick={handleResetAndClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white mb-4">Log New Trade</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Ticker Symbol
            </label>
            <input
              required
              type="text"
              placeholder="e.g. TSLA"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Action
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as TradeAction)}
                className={styles.select + " w-full"}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Shares / Quantity
              </label>
              <input
                required
                type="number"
                placeholder="e.g. 500"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Entry Price ($)
              </label>
              <input
                required
                type="number"
                step="0.01"
                placeholder="e.g. 150.25"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Exit Price ($ - Opt)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Open"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Exit Type
              </label>
              <select
                value={exitType}
                onChange={(e) => setExitType(e.target.value as ExitType)}
                className={styles.select + " w-full"}
                disabled={!exitPrice}
              >
                <option value="TP">🎯 Target Hit (TP)</option>
                <option value="SL">🛡️ Stop Loss (SL)</option>
                <option value="MANUAL">👤 Manual Close</option>
                <option value="TRAILING_STOP">🎛️ Trailing Stop</option>
                <option value="EOD">⏱️ End of Day (EOD)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Entry/Exit Reason / Notes
              </label>
              <textarea
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="e.g. Breakout resistance"
                rows={2}
                className={styles.input + " resize-none min-h-[36px] w-full"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Holding (Mins & Secs)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mins"
                  value={holdingMinutes}
                  onChange={(e) => setHoldingMinutes(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Secs"
                  value={holdingSeconds}
                  onChange={(e) => setHoldingSeconds(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Realized PnL ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 150.00"
                value={realizedPnl}
                onChange={(e) => setRealizedPnl(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Commission ($)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1.00"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetAndClose}
              className={styles.btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={styles.btnPrimary}
            >
              {submitting ? "Saving..." : "Save Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
