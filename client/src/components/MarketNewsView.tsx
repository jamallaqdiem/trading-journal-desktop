import React, { useState, useEffect } from "react";
import {
  Newspaper,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  MinusCircle,
  Plus,
  X,
} from "lucide-react";
import type { MarketNews } from "../types";
import { newsApi } from "../api/axiosClient";
import { styles } from "../styles/classes";

type SentimentType = "BULLISH" | "BEARISH" | "NEUTRAL";

export const MarketNewsView: React.FC = () => {
  const [news, setNews] = useState<MarketNews[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New item form state
  const [ticker, setTicker] = useState<string>("");
  const [headline, setHeadline] = useState<string>("");
  const [sentiment, setSentiment] = useState<SentimentType>("BULLISH");
  const [source, setSource] = useState<string>("Bloomberg");

  // Fetch news from backend (supports dynamic ticker/company search queries)
  const fetchNews = async (query?: string) => {
    try {
      setLoading(true);
      const res = await newsApi.getAll(query);
      setNews(res.data || []);
    } catch (err) {
      console.error("Error fetching market news:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect: queries backend dynamically as you type
  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const queryParam = searchTerm.trim() ? searchTerm.trim() : undefined;
        const res = await newsApi.getAll(queryParam);
        if (isMounted) {
          setNews(res.data || []);
        }
      } catch (err) {
        console.error("Error fetching market news:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 400); // 400ms debounce delay

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await newsApi.create({
        ticker: ticker.toUpperCase(),
        headline,
        sentiment,
        source,
        date: new Date().toISOString(),
      });
      setIsModalOpen(false);
      setTicker("");
      setHeadline("");
      fetchNews();
    } catch (err) {
      console.error("Error creating news item:", err);
      alert("Failed to save news catalyst.");
    }
  };

  // Client-side sentiment filtering
  const filteredNews = news.filter((item) => {
    return sentimentFilter === "ALL" || item.sentiment === sentimentFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            Market Catalyst & News Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time market headlines, earnings catalysts, and sentiment impact
            tracking.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.btnPrimary + " text-xs flex items-center gap-1.5"}
        >
          <Plus className="w-4 h-4" /> Add Catalyst
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-[#151921] p-4 rounded-xl border border-[#2A303F]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company name or ticker (e.g. MSFT, QuantumScape)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input + " pl-9"}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className={styles.select}
          >
            <option value="ALL">All Sentiments</option>
            <option value="BULLISH">Bullish</option>
            <option value="BEARISH">Bearish</option>
            <option value="NEUTRAL">Neutral</option>
          </select>
        </div>
      </div>

      {/* News List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">
          Fetching live news catalysts...
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No market news articles found.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#151921] border border-[#2A303F] hover:border-[#3B4252] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {item.ticker}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">{item.source}</span>
                  <span className="text-slate-500">•</span>
                  <span>
                    {new Date(item.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors underline decoration-slate-600 underline-offset-4"
                    >
                      {item.headline}
                    </a>
                  ) : (
                    item.headline
                  )}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {item.sentiment === "BULLISH" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-3.5 h-3.5" /> BULLISH
                  </span>
                )}
                {item.sentiment === "BEARISH" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <TrendingDown className="w-3.5 h-3.5" /> BEARISH
                  </span>
                )}
                {item.sentiment === "NEUTRAL" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">
                    <MinusCircle className="w-3.5 h-3.5" /> NEUTRAL
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add News Modal */}
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
              Add Market Catalyst
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Ticker
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
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Headline
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter news headline or summary..."
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={styles.input + " resize-none"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Sentiment
                  </label>
                  <select
                    value={sentiment}
                    onChange={(e) =>
                      setSentiment(e.target.value as SentimentType)
                    }
                    className={styles.select + " w-full"}
                  >
                    <option value="BULLISH">Bullish</option>
                    <option value="BEARISH">Bearish</option>
                    <option value="NEUTRAL">Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className={styles.input}
                  />
                </div>
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
                  Save Catalyst
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
