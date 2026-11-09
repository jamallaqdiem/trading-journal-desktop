import React, { useState, useEffect } from "react";
import { tradesApi } from "./api/axiosClient";
import type { Trade, ActiveTab } from "./types";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { StatCards } from "./components/StatCards";
import { TradesFilter } from "./components/TradesFilter";
import { TradesTable } from "./components/TradesTable";
import { AddTradeModal } from "./components/AddTradeModal";
import { MarketNewsView } from "./components/MarketNewsView";
import { DailyJournalView } from "./components/DailyJournalView";
import { OverviewAnalyticsView } from "./components/OverviewAnalyticsView";
import { TradesActionsBar } from "./components/TradesActionsBar";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await tradesApi.getAll();
      setTrades(res.data || []);
      setIsApiConnected(true);
    } catch (err) {
      console.error("Error fetching trades:", err);
      setIsApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTrades = async () => {
      if (activeTab === "trades" || activeTab === "overview") {
        await fetchTrades();
      }
    };
    loadTrades();
  }, [activeTab]);
  const filteredTrades = trades.filter((t) => {
    const matchesSearch = t.ticker
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || t.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleUpdateTrade = async (
    id: number,
    updatedFields: Partial<Trade>,
  ) => {
    try {
      await tradesApi.update(id, updatedFields);
      // refresh trades or update local state directly
      setTrades((prevTrades) =>
        prevTrades.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)),
      );
    } catch (err) {
      console.error("Failed to update trade:", err);
    }
  };
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 flex flex-col font-sans">
      <Header
        isApiConnected={isApiConnected}
        onOpenModal={() => setIsModalOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 space-y-6">
          {activeTab === "trades" && (
            <>
              <StatCards trades={trades} />
              <TradesActionsBar trades={trades} onRefresh={fetchTrades} />
              <TradesFilter
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                actionFilter={actionFilter}
                setActionFilter={setActionFilter}
              />
              <TradesTable
                trades={filteredTrades}
                loading={loading}
                onUpdateTrade={handleUpdateTrade}
              />
            </>
          )}
          {activeTab === "overview" && (
            <OverviewAnalyticsView trades={trades} />
          )}

          {activeTab === "news" && <MarketNewsView />}
          {activeTab === "journal" && <DailyJournalView />}
        </main>
      </div>

      <AddTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTrades}
      />
    </div>
  );
};

export default App;
