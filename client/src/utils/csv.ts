import type { Trade } from "../types";

//  EXPORT TRADES TO CSV

export function exportTradesToCSV(trades: Trade[]): void {
  if (!trades || trades.length === 0) {
    alert("No trades available to export.");
    return;
  }

  const headers = [
    "ID",
    "Entry Date",
    "Exit Date",
    "Ticker",
    "Action",
    "Shares",
    "Entry Price",
    "Exit Price",
    "Holding Period (Min)",
    "Realized PnL",
    "Commission",
    "Exit Type",
    "Exit Reason",
    "Exchange",
    "Notes",
  ];

  const rows = trades.map((t) => [
    t.id ?? "",
    t.entry_date ? new Date(t.entry_date).toISOString().split("T")[0] : "",
    t.exit_date ? new Date(t.exit_date).toISOString().split("T")[0] : "",
    `"${t.ticker || ""}"`,
    `"${t.action || t.type || ""}"`,
    t.shares ?? 0,
    t.entry_price ?? 0,
    t.exit_price ?? 0,
    t.holding_period_minutes ?? 0,
    t.realized_pnl ?? 0,
    t.commission ?? 0,
    `"${t.exit_type || ""}"`,
    `"${t.exit_reason || ""}"`,
    `"${t.exchange || "SMART"}"`,
    `"${(t.notes || "").replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `trades_export_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// PARSE & SANITIZE IMPORTED CSV
export function parseTradesCSV(csvText: string): Omit<Trade, "id">[] {
  const lines = csvText.split(/\r\n|\n/).filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];

  // Remove headers
  const dataLines = lines.slice(1);

  return dataLines
    .map((line) => {
      // Handles standard commas and quoted strings containing commas
      const matches =
        line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
      const clean = (val?: string) =>
        val ? val.replace(/^"|"$/g, "").trim() : "";

      const ticker = clean(matches[3]) || clean(matches[2]) || "UNKNOWN";
      const actionRaw = clean(matches[4]).toUpperCase();
      const action: "BUY" | "SELL" = actionRaw.includes("SELL")
        ? "SELL"
        : "BUY";

      return {
        entry_date: clean(matches[1]) || new Date().toISOString().split("T")[0],
        exit_date: clean(matches[2]) || null,
        ticker,
        action,
        shares: parseFloat(clean(matches[5])) || 0,
        entry_price: parseFloat(clean(matches[6])) || 0,
        exit_price: parseFloat(clean(matches[7])) || 0,
        holding_period_minutes: parseInt(clean(matches[8])) || 0,
        realized_pnl: parseFloat(clean(matches[9])) || 0,
        commission: parseFloat(clean(matches[10])) || 0,
        exit_type: (clean(matches[11]) as Trade["exit_type"]) || null,
        exit_reason: clean(matches[12]) || null,
        exchange: clean(matches[13]) || "SMART",
        notes: clean(matches[14]) || "Imported via CSV",
      };
    })
    .filter((trade) => trade.shares > 0 && trade.entry_price > 0); // Sanitize out bad rows
}
