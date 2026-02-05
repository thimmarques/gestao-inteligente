import React from "react";
import { Clock, Calendar, Loader2 } from "lucide-react";
import { formatDate } from "../../../utils/formatters.ts";
import { useDeadlinesByCase } from "../../../hooks/useQueries";

interface DeadlinesTabProps {
  caseId: string;
}

export const DeadlinesTab: React.FC<DeadlinesTabProps> = ({ caseId }) => {
  const { data: deadlines = [], isLoading } = useDeadlinesByCase(caseId);

  const getStatusInfo = (date: string, status: string) => {
    if (status === "concluído")
      return {
        color: "border-green-500",
        bg: "bg-green-500",
        text: "Concluído",
        labelColor: "text-green-600",
      };
    const diff = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0)
      return {
        color: "border-slate-400",
        bg: "bg-slate-400",
        text: `Vencido há ${Math.abs(diff)} dias`,
        labelColor: "text-slate-500",
      };
    if (diff === 0)
      return {
        color: "border-red-600",
        bg: "bg-red-600",
        text: "Vence HOJE",
        labelColor: "text-red-600",
      };
    if (diff <= 3)
      return {
        color: "border-red-500",
        bg: "bg-red-500",
        text: `Faltam ${diff} dias`,
        labelColor: "text-red-500",
      };
    if (diff <= 7)
      return {
        color: "border-yellow-500",
        bg: "bg-yellow-500",
        text: `Faltam ${diff} dias`,
        labelColor: "text-yellow-600",
      };
    return {
      color: "border-green-500",
      bg: "bg-green-500",
      text: `Faltam ${diff} dias`,
      labelColor: "text-green-600",
    };
  };

  const handleAddClick = () => {
    alert("Use o botão de novo prazo na tela principal de prazos.");
  };

  return (
    <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold dark:text-white">
            Prazos Processuais
          </h3>
          <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full border border-primary-200 dark:border-primary-800">
            {deadlines.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 size={32} className="animate-spin text-primary-600 mb-2" />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Carregando prazos...
            </p>
          </div>
        ) : deadlines.length > 0 ? (
          deadlines
            .sort(
              (a, b) =>
                new Date(a.deadline_date).getTime() -
                new Date(b.deadline_date).getTime(),
            )
            .map((deadline) => {
              const info = getStatusInfo(
                deadline.deadline_date,
                deadline.status,
              );
              return (
                <div
                  key={deadline.id}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border-l-4 ${info.color} border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${info.bg}`} />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm dark:text-white">
                        {deadline.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(deadline.deadline_date)}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${info.labelColor}`}
                        >
                          {info.text}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            deadline.priority === "urgente"
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <Clock size={48} className="text-slate-300 mb-4 opacity-50" />
            <h4 className="text-lg font-bold dark:text-white mb-2">
              Nenhum prazo cadastrado
            </h4>
            <p className="text-slate-500 text-sm mb-6 max-w-xs">
              Mantenha seu escritório organizado adicionando prazos fatais.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
