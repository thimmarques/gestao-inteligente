import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
  Check,
} from 'lucide-react';
import { Deadline } from '../../types';
import {
  getDeadlineStatus,
  getPriorityColor,
} from '../../utils/deadlineCalculations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeadlineListProps {
  deadlines: Deadline[];
  onCheckComplete: (id: string) => void;
  onRowClick: (deadline: Deadline) => void;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
}

export const DeadlineList: React.FC<DeadlineListProps> = ({
  deadlines,
  onCheckComplete,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const [completingId, setCompletingId] = useState<string | null>(null);

  const handleComplete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (completingId) return;

    setCompletingId(id);
    try {
      await onCheckComplete(id);
    } finally {
      setCompletingId(null);
    }
  };

  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
          <Clock size={40} />
        </div>
        <h3 className="text-xl font-bold dark:text-white">
          Nenhum prazo encontrado
        </h3>
        <p className="text-slate-500 mt-2 max-w-xs">
          Ajuste os filtros ou crie um novo prazo para acompanhar seu andamento.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy-800/50 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 w-12"></th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Título / Objeto
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Processo / Cliente
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Vencimento
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Prioridade
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {deadlines.map((d) => {
              const { color, text } = getDeadlineStatus(d);
              const isPendente = d.status !== 'concluído';

              return (
                <tr
                  key={d.id}
                  onClick={() => onRowClick(d)}
                  className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${!isPendente ? 'opacity-60 grayscale-[0.5]' : ''}`}
                >
                  <td
                    className="px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isPendente ? (
                      <button
                        onClick={(e) => handleComplete(e, d.id)}
                        disabled={completingId === d.id}
                        className={`w-6 h-6 rounded-lg border-2 border-slate-200 dark:border-white/15 flex items-center justify-center transition-all hover:border-green-500 hover:scale-110 active:scale-95 group-hover:border-slate-400 ${completingId === d.id ? 'bg-slate-50' : 'bg-white dark:bg-navy-800'}`}
                        title="Finalizar"
                      >
                        {completingId === d.id ? (
                          <Loader2
                            size={12}
                            className="animate-spin text-primary-500"
                          />
                        ) : (
                          <Check
                            size={12}
                            className="text-slate-200 group-hover:text-green-500 transition-colors"
                          />
                        )}
                      </button>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-green-500 flex items-center justify-center text-white shadow-sm shadow-green-500/20 animate-in zoom-in">
                        <CheckCircle2 size={12} strokeWidth={3} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-tighter`}
                        style={{ color }}
                      >
                        {text}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold dark:text-white group-hover:text-primary-600 transition-colors">
                      {d.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {d.case?.process_number || 'S/ Processo'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {d.case?.client.name || 'S/ Cliente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-slate-200">
                        {format(new Date(d.deadline_date), 'dd/MM/yyyy')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {format(new Date(d.deadline_date), 'EEEE', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border"
                      style={{
                        color: getPriorityColor(d.priority),
                        borderColor: `${getPriorityColor(d.priority)}20`,
                        backgroundColor: `${getPriorityColor(d.priority)}10`,
                      }}
                    >
                      {d.priority}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isPendente && (
                        <button
                          onClick={(e) => handleComplete(e, d.id)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                          title="Finalizar Prazo"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(d)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(d.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Deletar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
