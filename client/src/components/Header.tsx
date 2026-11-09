import React from "react";
import { Plus, Database, CheckCircle2, XCircle } from "lucide-react";
import { styles } from "../styles/classes";

interface HeaderProps {
  isApiConnected: boolean;
  onOpenModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isApiConnected,
  onOpenModal,
}) => {
  return (
    <header className={styles.glassHeader}>
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white tracking-wide">
          Trading Analytics Platform
        </h1>
        <div className="flex items-center gap-2 bg-[#0B0E14] px-3 py-1 rounded-full border border-[#2A303F] text-xs">
          <Database className="w-3.5 h-3.5 text-slate-400" />

          {isApiConnected ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Online
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <XCircle className="w-3 h-3" /> Offline
            </span>
          )}
        </div>
      </div>
      <button onClick={onOpenModal} className={styles.btnPrimary}>
        <Plus className="w-4 h-4" /> New Trade
      </button>
    </header>
  );
};
