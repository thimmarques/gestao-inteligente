import React from 'react';
import {
  Clock,
  Calendar,
  Loader2,
  Plus,
  Edit2,
  CheckCircle,
  Circle,
  Trash2,
} from 'lucide-react';
import { formatDate } from '../../../utils/formatters.ts';
import { useDeadlinesByCase, useCase } from '../../../hooks/useQueries';
import { CreateDeadlineModal } from '../../deadlines/CreateDeadlineModal.tsx';
import { deadlineService } from '../../../services/deadlineService.ts';
import { useQueryClient } from '@tanstack/react-query';

interface DeadlinesTabProps {
  caseId: string;
}

export const DeadlinesTab: React.FC<DeadlinesTabProps> = ({ caseId }) => {
  const {
    data: deadlines = [],
    isLoading,
    refetch,
  } = useDeadlinesByCase(caseId);
  const { data: caseData } = useCase(caseId);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingDeadline, setEditingDeadline] = React.useState<any>(null);

  const handleToggleStatus = async (deadline: any) => {
    const newStatus =
      deadline.status === 'concluído' ? 'pendente' : 'concluído';
    const description =
      newStatus === 'concluído'
        ? `Prazo concluído: ${deadline.title}`
        : `Prazo reaberto: ${deadline.title}`;

    await deadlineService.updateDeadline(deadline.id, {
      status: newStatus,
      completed_at: newStatus === 'concluído' ? new Date().toISOString() : null,
      customLogDescription: description,
    } as any);
    refetch();
    queryClient.invalidateQueries({
      queryKey: ['audit_logs', 'entity', caseId],
    });
  };

  const handleDelete = async (deadline: any) => {
    if (confirm(`Excluir o prazo "${deadline.title}"?`)) {
      await deadlineService.deleteDeadline(deadline.id);
      refetch();
      queryClient.invalidateQueries({
        queryKey: ['audit_logs', 'entity', caseId],
      });
    }
  };

  const getStatusInfo = (date: string, status: string) => {
    if (status === 'concluído')
      return {
        color: 'border-green-500',
        bg: 'bg-green-500',
        text: 'Concluído',
        labelColor: 'text-green-600',
      };
    const diff = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0)
      return {
        color: 'border-slate-400',
        bg: 'bg-slate-400',
        text: `Vencido há ${Math.abs(diff)} dias`,
        labelColor: 'text-slate-500',
      };
    if (diff === 0)
      return {
        color: 'border-red-600',
        bg: 'bg-red-600',
        text: 'Vence HOJE',
        labelColor: 'text-red-600',
      };
    if (diff <= 3)
      return {
        color: 'border-red-500',
        bg: 'bg-red-500',
        text: `Faltam ${diff} dias`,
        labelColor: 'text-red-500',
      };
    if (diff <= 7)
      return {
        color: 'border-yellow-500',
        bg: 'bg-yellow-500',
        text: `Faltam ${diff} dias`,
        labelColor: 'text-yellow-600',
      };
    return {
      color: 'border-green-500',
      bg: 'bg-green-500',
      text: `Faltam ${diff} dias`,
      labelColor: 'text-green-600',
    };
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black dark:text-white tracking-tight">
            Prazos Processuais
          </h3>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-black border border-blue-200 dark:border-blue-800">
            {deadlines.length}
          </div>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-3 px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          <Plus size={20} />
          Novo Prazo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-navy-800/50 rounded-3xl border border-slate-200 dark:border-white/10">
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
                new Date(b.deadline_date).getTime()
            )
            .map((deadline) => {
              const info = getStatusInfo(
                deadline.deadline_date,
                deadline.status
              );
              return (
                <div
                  key={deadline.id}
                  className={`bg-white dark:bg-navy-800/50 p-5 rounded-2xl border-l-4 ${info.color} border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow`}
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
                            deadline.priority === 'urgente'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {deadline.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(deadline)}
                      title={
                        deadline.status === 'concluído'
                          ? 'Marcar como pendente'
                          : 'Marcar como concluído'
                      }
                      className={`p-2 rounded-xl transition-all ${
                        deadline.status === 'concluído'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-slate-50 text-slate-400 hover:text-primary-600 dark:bg-white/5'
                      }`}
                    >
                      {deadline.status === 'concluído' ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDeadline(deadline);
                        setIsModalOpen(true);
                      }}
                      title="Editar prazo"
                      className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(deadline)}
                      title="Excluir prazo"
                      className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-navy-800/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/10 text-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-navy-800 flex items-center justify-center mb-6">
              <Clock size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h4 className="text-xl font-black dark:text-white mb-2">
              Nenhum prazo cadastrado
            </h4>
            <p className="text-slate-500 text-sm mb-8 max-w-[280px]">
              Mantenha seu escritório organizado adicionando prazos fatais.
            </p>
            <button
              onClick={handleAddClick}
              className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] hover:text-primary-700 transition-colors"
            >
              CRIAR PRIMEIRO PRAZO AGORA
            </button>
          </div>
        )}
      </div>

      <CreateDeadlineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeadline(null);
        }}
        defaultCaseId={caseId}
        mode={editingDeadline ? 'edit' : 'create'}
        initialData={editingDeadline}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ['audit_logs', 'entity', caseId],
          });
          setIsModalOpen(false);
          setEditingDeadline(null);
        }}
      />
    </div>
  );
};
