import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  Filter,
  ChevronDown,
  Calendar,
  Briefcase,
  User,
} from "lucide-react";
import { DeadlineFilters } from "../../types";

interface DeadlineFiltersBarProps {
  onFilterChange: (filters: Partial<DeadlineFilters>) => void;
  resultsCount: number;
}

export const DeadlineFiltersBar: React.FC<DeadlineFiltersBarProps> = ({
  onFilterChange,
  resultsCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState<
    "priority" | "process" | null
  >(null);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedProcess, setSelectedProcess] = useState("todos");

  const priorities = ["baixa", "média", "alta", "urgente"];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const togglePriority = (p: string) => {
    const next = selectedPriorities.includes(p)
      ? selectedPriorities.filter((item) => item !== p)
      : [...selectedPriorities, p];
    setSelectedPriorities(next);
    onFilterChange({ priority: next });
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedPriorities([]);
    setSelectedProcess("todos");
    onFilterChange({ search: "", priority: [], caseId: "todos" });
  };

  const isFiltered =
    searchTerm || selectedPriorities.length > 0 || selectedProcess !== "todos";

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex-1 relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título ou processo..."
          className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Prioridade Dropdown */}
        <div className="relative">
          <button
            onClick={() =>
              setOpenDropdown(openDropdown === "priority" ? null : "priority")
            }
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedPriorities.length > 0
                ? "bg-primary-50 border-primary-200 text-primary-700"
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400"
            }`}
          >
            Prioridade
            {selectedPriorities.length > 0 && (
              <span className="bg-primary-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                {selectedPriorities.length}
              </span>
            )}
            <ChevronDown
              size={14}
              className={`transition-transform ${openDropdown === "priority" ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown === "priority" && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 animate-in zoom-in-95">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePriority(p)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${selectedPriorities.includes(p) ? "bg-primary-600 ring-4 ring-primary-500/20" : "bg-slate-200 dark:bg-slate-700"}`}
                  />
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botão Limpar */}
        {isFiltered && (
          <button
            onClick={handleClear}
            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title="Limpar filtros"
          >
            <X size={20} />
          </button>
        )}

        <div className="px-4 border-l border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {resultsCount} Resultados
          </span>
        </div>
      </div>

      {openDropdown && (
        <div
          className="fixed inset-0 z-[40]"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};
