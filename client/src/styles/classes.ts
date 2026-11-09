export const styles = {
  // Layout containers
  card: "bg-[#151921] border border-[#2A303F] rounded-xl p-5 shadow-lg",
  glassHeader:
    "bg-[#151921]/90 backdrop-blur-md border-b border-[#2A303F] px-6 py-4 flex items-center justify-between sticky top-0 z-10",

  // Buttons
  btnPrimary:
    "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer",
  btnSecondary:
    "bg-[#1E232F] hover:bg-[#2A303F] text-slate-200 border border-[#2A303F] px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer",
  btnDanger:
    "bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer",

  // Inputs & Selects
  input:
    "w-full bg-[#0B0E14] border border-[#2A303F] rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors",
  select:
    "bg-[#0B0E14] border border-[#2A303F] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer",

  // Table Styling
  tableHeader:
    "bg-[#1E232F] text-slate-400 text-xs uppercase tracking-wider text-left py-3 px-4 font-semibold border-b border-[#2A303F]",
  tableRow:
    "border-b border-[#2A303F]/50 hover:bg-[#1E232F]/50 transition-colors text-sm text-slate-300",
  tableCell: "py-3.5 px-4",

  // Badges
  badgeBuy:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block",
  badgeSell:
    "bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block",
  badgeTag:
    "bg-[#1E232F] text-slate-300 border border-[#2A303F] px-2 py-0.5 rounded text-xs font-mono inline-block",
  badgeBot:
    "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-xs font-mono inline-flex items-center gap-1",
};
