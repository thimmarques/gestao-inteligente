import React from "react";
import { List, LayoutGrid } from "lucide-react";

interface ViewToggleProps {
  view: "list" | "cards";
  onChange: (view: "list" | "cards") => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  return (
    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <button
        onClick={() => {
          onChange("list");
          localStorage.setItem("deadlines_view", "list");
        }}
        className={`p-2.5 rounded-xl transition-all ${view === "list" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-400 hover:text-slate-600"}`}
        title="Visualização em Lista"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => {
          onChange("cards");
          localStorage.setItem("deadlines_view", "cards");
        }}
        className={`p-2.5 rounded-xl transition-all ${view === "cards" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-400 hover:text-slate-600"}`}
        title="Visualização em Cards"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  );
};
