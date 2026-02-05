import React, { useState, useEffect } from "react";
import { Search, X, Filter, ArrowUpDown, Download } from "lucide-react";
import { ClientFilters } from "../../utils/clientFilters";

interface ClientFiltersProps {
  onFilterChange: (filters: Partial<ClientFilters>) => void;
  onExport: () => void;
}

export const ClientFiltersBar: React.FC<ClientFiltersProps> = ({
  onFilterChange,
  onExport,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"status" | "order" | null>(
    null,
  );
  const [filters, setFilters] = useState<ClientFilters>({
    search: "",
    status: "todos",
    type: "todos",
    sortBy: "name",
    sortDirection: "asc",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateStatus = (status: ClientFilters["status"]) => {
    setFilters((prev) => ({ ...prev, status }));
    onFilterChange({ status });
    setOpenDropdown(null);
  };

  const updateOrder = (
    sortBy: ClientFilters["sortBy"],
    direction: ClientFilters["sortDirection"],
  ) => {
    setFilters((prev) => ({ ...prev, sortBy, sortDirection: direction }));
    onFilterChange({ sortBy, sortDirection: direction });
    setOpenDropdown(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      {/* Search Input */}
      <div className="flex-1 min-w-[300px] relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, CPF ou email..."
          className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === "status" ? null : "status")
          }
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${
            filters.status !== "todos"
              ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          <Filter size={16} />
          Status{" "}
          {filters.status !== "todos" && (
            <span className="ml-1 w-2 h-2 bg-primary-600 rounded-full" />
          )}
        </button>
        {openDropdown === "status" && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95">
            {["todos", "ativo", "inativo"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s as any)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm capitalize ${filters.status === s ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort Filter */}
      <div className="relative">
        <button
          onClick={() =>
            setOpenDropdown(openDropdown === "order" ? null : "order")
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 transition-all shadow-sm"
        >
          <ArrowUpDown size={16} />
          Ordenar
        </button>
        {openDropdown === "order" && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 p-2 animate-in fade-in zoom-in-95">
            <button
              onClick={() => updateOrder("name", "asc")}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Nome (A-Z)
            </button>
            <button
              onClick={() => updateOrder("name", "desc")}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Nome (Z-A)
            </button>
            <button
              onClick={() => updateOrder("created_at", "desc")}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Mais Recentes
            </button>
            <button
              onClick={() => updateOrder("created_at", "asc")}
              className="w-full text-left px-4 py-2 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              Mais Antigos
            </button>
          </div>
        )}
      </div>

      {/* Export Button */}
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
      >
        <Download size={16} />
        Exportar
      </button>

      {/* Overlay to close dropdowns */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};
