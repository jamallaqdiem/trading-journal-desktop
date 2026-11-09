import React, { useState } from "react";
import { X, FileText, Check, Copy, Edit3, Save } from "lucide-react";

interface NotesModalProps {
  isOpen: boolean;
  tradeId?: number;
  ticker: string;
  action?: "BUY" | "SELL";
  entryDate?: string;
  notes: string | null;
  onClose: () => void;
  onSaveNotes?: (id: number, newNotes: string) => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  isOpen,
  tradeId,
  ticker,
  action,
  entryDate,
  notes,
  onClose,
  onSaveNotes,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || "");
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    setEditedNotes(notes || "");
    setIsEditing(false);
  }, [notes, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (notes) {
      navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    if (tradeId !== undefined && onSaveNotes) {
      onSaveNotes(tradeId, editedNotes);
    }
    setIsEditing(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-[#151921] border border-[#2A303F] rounded-2xl p-6 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2A303F]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Trade Psychology & Notes
                </h3>
                {action && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      action === "BUY"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {action}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {ticker}{" "}
                {entryDate
                  ? `• ${new Date(entryDate).toLocaleDateString()}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2330] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body with Enhanced Typography */}
        <div className="space-y-4">
          {isEditing ? (
            <div>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={6}
                className="w-full bg-[#0B0E14] border border-indigo-500/50 rounded-xl p-4 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed font-sans"
                placeholder="Log your market bias, entry trigger, setup grade, and emotional state..."
              />
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#1E2330]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="relative bg-[#0B0E14] border border-[#2A303F] border-l-4 border-l-amber-500 rounded-xl p-4 min-h-[120px] max-h-[50vh] overflow-y-auto shadow-inner">
              <p className="text-sm text-slate-200 font-medium leading-relaxed whitespace-pre-wrap tracking-wide font-sans">
                {notes || "No detailed notes provided for this trade setup."}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-3 border-t border-[#2A303F] text-xs">
          <div className="flex items-center gap-2">
            {notes && !isEditing && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2330] hover:bg-[#2A303F] text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied to Clipboard" : "Copy Notes"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && onSaveNotes && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Notes
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1E2330] hover:bg-[#2A303F] text-slate-200 font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
