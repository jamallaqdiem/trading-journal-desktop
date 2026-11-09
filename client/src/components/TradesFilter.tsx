import React from "react";
import { Search } from "lucide-react";
import { styles } from "../styles/classes";

interface TradesFilterProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  actionFilter: string;
  setActionFilter: (val: string) => void;
}

export const TradesFilter: React.FC<TradesFilterProps> = ({
  searchTerm,
  setSearchTerm,
  actionFilter,
  setActionFilter,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter by Ticker (e.g. TSLA, NVDA)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${styles.input} pl-9`}
        />
      </div>
      <select
        value={actionFilter}
        onChange={(e) => setActionFilter(e.target.value)}
        className={styles.select}
      >
        <option value="ALL">All Actions</option>
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
      </select>
    </div>
  );
};
