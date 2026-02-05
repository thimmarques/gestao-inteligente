import React from "react";
import { Check } from "lucide-react";

interface DeadlineStatusFiltersProps {
  activeFilters: string[];
  onFilterChange: (status: string[]) => void;
  counts: {
    ok: number;
    proximo: number;
    urgentes: number;
    hoje: number;
    vencidos: number;
    concluidos: number;
    total: number;
  };
}

export const DeadlineStatusFilters: React.FC<DeadlineStatusFiltersProps> = ({
  activeFilters,
  onFilterChange,
  counts,
}) => {
  const filters = [
    {
      id: "all",
      label: "Todos",
      color: "slate",
      count: counts.total,
      icon: null,
    },
    { id: "ok", label: "OK", color: "green", count: counts.ok, sub: ">7 dias" },
    {
      id: "proximo",
      label: "Atenção",
      color: "amber",
      count: counts.proximo,
      sub: "3-7 dias",
    },
    {
      id: "urgente",
      label: "Urgente",
      color: "red",
      count: counts.urgentes,
      sub: "<3 dias",
    },
    {
      id: "hoje",
      label: "Hoje",
      color: "red",
      count: counts.hoje,
      pulse: true,
    },
    {
      id: "vencido",
      label: "Vencidos",
      color: "slate",
      count: counts.vencidos,
    },
    {
      id: "concluido",
      label: "Concluídos",
      color: "emerald",
      count: counts.concluidos,
      icon: <Check size={10} />,
    },
  ];

  const handleToggle = (id: string) => {
    if (id === "all") {
      onFilterChange([]);
      return;
    }

    const next = activeFilters.includes(id)
      ? activeFilters.filter((f) => f !== id)
      : [...activeFilters, id];
    onFilterChange(next);
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const maps: Record<string, string> = {
      slate: isActive
        ? "bg-slate-600 text-white border-slate-600"
        : "text-slate-500 border-slate-200 hover:bg-slate-50 dark:border-slate-800",
      green: isActive
        ? "bg-green-600 text-white border-green-600"
        : "text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800",
      amber: isActive
        ? "bg-amber-500 text-white border-amber-500"
        : "text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800",
      red: isActive
        ? "bg-red-600 text-white border-red-600"
        : "text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800",
      emerald: isActive
        ? "bg-emerald-600 text-white border-emerald-600"
        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800",
    };
    return maps[color] || maps.slate;
  };

  return (
    <div className="flex flex-wrap gap-2 py-4">
      {filters.map((f) => {
        const isActive =
          f.id === "all"
            ? activeFilters.length === 0
            : activeFilters.includes(f.id);
        const colorClass = getColorClasses(f.color, isActive);

        return (
          <button
            key={f.id}
            onClick={() => handleToggle(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${colorClass}`}
          >
            <div className="relative">
              {f.pulse && !isActive && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              )}
              <div
                className={`w-2.5 h-2.5 rounded-full flex items-center justify-center ${isActive ? "bg-white" : `bg-current`}`}
              >
                {isActive && f.icon && (
                  <div className="text-emerald-600">{f.icon}</div>
                )}
              </div>
            </div>
            <span>{f.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
