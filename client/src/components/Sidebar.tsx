import React from "react";
import { LayoutDashboard, BarChart3, Newspaper, BookOpen } from "lucide-react";
import type { ActiveTab } from "../types";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "trades",
      label: "Trades Feed",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "news",
      label: "Market News",
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      id: "journal",
      label: "Daily Journal",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#151921] border-r border-[#2A303F] p-4 flex flex-col gap-2 min-h-[calc(100vh-65px)]">
      <div className="text-xs font-semibold uppercase text-slate-500 px-3 py-2">
        Navigation
      </div>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#1E232F]"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};
