import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Plus,
  Star,
  Brain,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import type { DailyJournal } from "../types";
import { journalApi } from "../api/axiosClient";
import { styles } from "../styles/classes";

type MarketBiasType = "Bullish" | "Bearish" | "Neutral";

export const DailyJournalView: React.FC = () => {
  const [entries, setEntries] = useState<DailyJournal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [marketBias, setMarketBias] = useState<MarketBiasType>("Bullish");
  const [psychologyRating, setPsychologyRating] = useState<number>(4);
  const [notes, setNotes] = useState<string>("");

  const fetchJournals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await journalApi.getAll();
      setEntries(res.data || []);
    } catch (err) {
      console.error("Error fetching journals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadJournals = async () => {
      try {
        setLoading(true);
        const res = await journalApi.getAll();
        if (isMounted) {
          setEntries(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching journals:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJournals();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await journalApi.create({
        date: new Date().toISOString().split("T")[0],
        market_bias: marketBias,
        psychology_rating: Number(psychologyRating),
        notes,
      });
      setIsModalOpen(false);
      setNotes("");
      fetchJournals();
    } catch (err) {
      console.error("Error saving journal entry:", err);
      alert("Failed to save journal entry.");
    }
  };

  const avgPsych =
    entries.length > 0
      ? (
          entries.reduce((acc, e) => acc + e.psychology_rating, 0) /
          entries.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Daily Trading Journal & Mindset Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track psychological discipline, market bias, and execution notes per
            trading session.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.btnPrimary + " text-xs flex items-center gap-1.5"}
        >
          <Plus className="w-4 h-4" /> New Journal Log
        </button>
      </div>

      {/* Top Discipline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={styles.card}>
          <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-cyan-400" /> Avg Psychology Score
          </span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-2">
            {avgPsych} / 5.0
          </p>
          <span className="text-[10px] text-slate-500">
            Emotional control & focus level
          </span>
        </div>

        <div className={styles.card}>
          <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Rules Adherence
            Rate
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            100%
          </p>
          <span className="text-[10px] text-slate-500">
            Stop loss & risk limit compliance
          </span>
        </div>

        <div className={styles.card}>
          <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-400" /> Total Journal
            Entries
          </span>
          <p className="text-2xl font-bold font-mono text-white mt-2">
            {entries.length} Sessions
          </p>
          <span className="text-[10px] text-slate-500">
            Logged session records
          </span>
        </div>
      </div>

      {/* Journal Entries Stream */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Loading journal logs from database...
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No journal logs found in database.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-5 rounded-xl bg-[#151921] border border-[#2A303F] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#2A303F] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      entry.market_bias === "Bullish"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : entry.market_bias === "Bearish"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-500/10 text-slate-300 border border-slate-500/20"
                    }`}
                  >
                    Bias: {entry.market_bias}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= entry.psychology_rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {entry.notes}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Journal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#151921] border border-[#2A303F] rounded-xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              Log Session Journal
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Session Market Bias
                </label>
                <select
                  value={marketBias}
                  onChange={(e) =>
                    setMarketBias(e.target.value as MarketBiasType)
                  }
                  className={styles.select + " w-full"}
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Bearish">Bearish</option>
                  <option value="Neutral">Neutral</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Psychology & Focus Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={psychologyRating}
                  onChange={(e) => setPsychologyRating(Number(e.target.value))}
                  className={styles.input}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Session Notes & Retrospective
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe market conditions, discipline, and execution quality..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={styles.input + " resize-none"}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
