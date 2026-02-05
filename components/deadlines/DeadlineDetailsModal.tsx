import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Briefcase,
  User,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Info,
  ArrowLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  // Added Loader2 to fix missing import error
  Loader2,
} from "lucide-react";
import { Deadline } from "../../types";
import {
  getDeadlineStatus,
  getPriorityColor,
  calculateDaysRemaining,
} from "../../utils/deadlineCalculations";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeadlineDetailsModalProps {
  deadline: Deadline | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const DeadlineDetailsModal: React.FC<DeadlineDetailsModalProps> = ({
  deadline,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (!isOpen || !deadline) return null;

  const { color, text, status: visualStatus } = getDeadlineStatus(deadline);
  const days = calculateDaysRemaining(deadline.deadline_date);
  const isPendente = deadline.status !== "concluído";

  const handleToggle = async () => {
    setIsActionLoading(true);
    await onToggleStatus(deadline.id);
    setIsActionLoading(false);
  };

  const handleConfirmDelete = () => {
    if (confirm("Deseja realmente remover este prazo permanentemente?")) {
      onDelete(deadline.id);
      onClose();
    }
  };

  const completedInfo = deadline.completed_at
    ? (() => {
        const diff = differenceInDays(
          new Date(deadline.deadline_date),
          new Date(deadline.completed_at),
        );
        return {
          diff,
          text:
            diff >= 0
              ? `Concluído ${diff} dias antes do prazo`
              : `Concluído com ${Math.abs(diff)} dias de atraso`,
          color: diff >= 0 ? "text-green-600" : "text-red-600",
        };
      })()
    : null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        {/* Header Strip */}
        <div className="h-3 w-full" style={{ backgroundColor: color }} />

        {/* Header */}
        <div className="px-10 pt-10 pb-6 flex items-start justify-between">
          <div className="flex gap-6">
            <div
              className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl"
              style={{ backgroundColor: color }}
            >
              {days <= 2 && isPendente ? (
                <AlertTriangle size={32} />
              ) : (
                <Calendar size={32} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border`}
                  style={{
                    color,
                    borderColor: `${color}40`,
                    backgroundColor: `${color}10`,
                  }}
                >
                  {text}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  ID: {deadline.id.slice(0, 8)}
                </span>
              </div>
              <h2 className="text-2xl font-black dark:text-white leading-tight">
                {deadline.title}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(deadline)}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 rounded-2xl text-slate-400 hover:text-primary-600 transition-all shadow-sm"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={handleConfirmDelete}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-10 py-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          {/* Large Countdown */}
          <div
            className={`p-10 rounded-[2.5rem] text-center border-2 transition-all ${
              isPendente
                ? "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800"
                : "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
            }`}
          >
            {isPendente ? (
              <div className="space-y-2">
                <p
                  className="text-7xl font-black tabular-nums tracking-tighter"
                  style={{ color }}
                >
                  {days === 0 ? "HOJE" : days}
                </p>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                  {days === 0
                    ? "O PRAZO SE ENCERRA"
                    : days < 0
                      ? "DIAS DE ATRASO"
                      : "DIAS RESTANTES"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/30 mx-auto mb-4 animate-in zoom-in">
                  <CheckCircle2 size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-green-600 uppercase tracking-tight">
                  Prazo Finalizado
                </h3>
                {completedInfo && (
                  <p
                    className={`text-xs font-bold uppercase tracking-widest ${completedInfo.color}`}
                  >
                    {completedInfo.text}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Data Limite
                  </p>
                  <p className="text-sm font-bold dark:text-white">
                    {format(new Date(deadline.deadline_date), "dd/MM/yyyy")}
                    <span className="ml-2 text-slate-400 font-medium">
                      (
                      {format(new Date(deadline.deadline_date), "EEEE", {
                        locale: ptBR,
                      })}
                      )
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Briefcase size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Processo Vinculado
                  </p>
                  <p className="text-sm font-bold text-primary-600 hover:underline cursor-pointer truncate font-mono">
                    {deadline.case?.process_number || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Info size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Prioridade
                  </p>
                  <span
                    className="text-sm font-black uppercase tracking-wider"
                    style={{ color: getPriorityColor(deadline.priority) }}
                  >
                    {deadline.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Cliente
                  </p>
                  <p className="text-sm font-bold dark:text-white">
                    {deadline.case?.client.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <FileText size={12} /> Descrição e Orientações
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              {deadline.description
                ? `"${deadline.description}"`
                : "Nenhuma descrição detalhada fornecida para este prazo."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          {isPendente ? (
            <button
              onClick={handleToggle}
              disabled={isActionLoading}
              className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isActionLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <CheckCircle2 size={24} />
              )}
              Marcar como Concluído
            </button>
          ) : (
            <button
              onClick={handleToggle}
              disabled={isActionLoading}
              className="w-full py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              {isActionLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <ArrowLeft size={24} />
              )}
              Reverter para Pendente
            </button>
          )}
        </div>
      </div>

      {/* Overlay to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};
