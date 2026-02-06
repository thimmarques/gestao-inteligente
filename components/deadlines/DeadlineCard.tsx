import React from 'react';
import {
  Calendar,
  Briefcase,
  CheckCircle2,
  User,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Deadline } from '../../types';
import {
  getDeadlineStatus,
  getPriorityColor,
  calculateDaysRemaining,
} from '../../utils/deadlineCalculations';
import { format } from 'date-fns';

interface DeadlineCardProps {
  deadline: Deadline;
  onComplete: (id: string) => void;
  onClick: (deadline: Deadline) => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({
  deadline,
  onComplete,
  onClick,
}) => {
  const { color, text, status } = getDeadlineStatus(deadline);
  const days = calculateDaysRemaining(deadline.deadline_date);
  const isPendente = deadline.status !== 'concluído';

  return (
    <div
      onClick={() => onClick(deadline)}
      className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 border-l-[8px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden ${!isPendente ? 'opacity-60 grayscale-[0.5]' : ''}`}
      style={{ borderLeftColor: color }}
    >
      {/* Visual Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-bl-[5rem] -mr-16 -mt-16 -z-10 group-hover:scale-110 transition-transform" />

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div
          className={`w-3 h-3 rounded-full ${days <= 2 && isPendente ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: color }}
        />
        <span
          className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
          style={{
            color: getPriorityColor(deadline.priority),
            borderColor: `${getPriorityColor(deadline.priority)}40`,
            backgroundColor: `${getPriorityColor(deadline.priority)}10`,
          }}
        >
          {deadline.priority}
        </span>
      </div>

      {/* Body */}
      <div className="space-y-4 mb-8">
        <h3 className="text-xl font-black dark:text-white leading-tight group-hover:text-primary-600 transition-colors">
          {deadline.title}
        </h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Briefcase size={14} className="text-primary-500" />
            <span className="font-mono text-xs font-bold">
              {deadline.case?.process_number}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <User size={14} />
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              {deadline.case?.client.name}
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-primary-500 transition-colors">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Data Limite
            </p>
            <p className="text-sm font-bold dark:text-white">
              {format(new Date(deadline.deadline_date), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="pt-2">
          {days === 0 && isPendente ? (
            <div className="flex items-center gap-2 text-red-600 animate-pulse">
              <AlertTriangle size={24} strokeWidth={3} />
              <span className="text-3xl font-black uppercase tracking-tighter italic">
                VENCE HOJE!
              </span>
            </div>
          ) : days < 0 && isPendente ? (
            <span className="text-2xl font-black text-slate-400 uppercase italic">
              Vencido há {Math.abs(days)} dias
            </span>
          ) : (
            <div className="flex flex-col">
              <span
                className="text-3xl font-black tabular-nums"
                style={{ color }}
              >
                {days}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Dias Restantes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            isPendente && onComplete(deadline.id);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            !isPendente
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary-600 hover:text-white'
          }`}
        >
          {isPendente ? (
            <div className="w-4 h-4 rounded border-2 border-current" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {isPendente ? 'Marcar Concluído' : 'Prazo Concluído'}
        </button>

        <button className="p-2 text-slate-300 hover:text-primary-500 transition-all">
          <Eye size={20} />
        </button>
      </div>
    </div>
  );
};
