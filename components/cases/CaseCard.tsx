import React from 'react';
import { Building, Calendar, ArrowRight, Scale, User } from 'lucide-react';
import { CaseWithRelations } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CaseCardProps {
  caseData: CaseWithRelations;
  onClick: () => void;
}

const statusColorMap: Record<string, string> = {
  distribuído:
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  andamento: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sentenciado:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  recurso:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  arquivado:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  encerrado:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const typeColorMap: Record<string, string> = {
  cível: 'text-blue-600 dark:text-blue-400',
  trabalhista: 'text-emerald-600 dark:text-emerald-400',
  criminal: 'text-red-600 dark:text-red-400',
  família: 'text-purple-600 dark:text-purple-400',
  tributário: 'text-amber-600 dark:text-amber-400',
  administrativo: 'text-indigo-600 dark:text-indigo-400',
  previdenciário: 'text-pink-600 dark:text-pink-400',
};

export const CaseCard: React.FC<CaseCardProps> = ({ caseData, onClick }) => {
  return (
    <div
      className="bg-white dark:bg-navy-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col h-full glass-card"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-6">
        <span className="font-mono text-[11px] font-black text-primary-600 truncate max-w-[150px] uppercase tracking-tighter">
          {caseData.process_number}
        </span>
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColorMap[caseData.status.toLowerCase()] || 'bg-slate-100'}`}
        >
          {caseData.status}
        </span>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-sm font-black text-primary-600 border border-primary-100 dark:border-primary-800 shadow-inner">
            {caseData.client?.name?.charAt(0) || <User size={16} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black dark:text-white truncate">
              {caseData.client?.name || 'Cliente Indefinido'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 truncate flex items-center gap-1 uppercase">
              <Building size={10} />
              {caseData.court}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Scale
            size={14}
            className={
              typeColorMap[caseData.type.toLowerCase()] || 'text-slate-400'
            }
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${typeColorMap[caseData.type.toLowerCase()] || 'text-slate-500'}`}
          >
            {caseData.type}
          </span>
        </div>

        {caseData.value > 0 && (
          <p className="text-base font-black dark:text-white tabular-nums">
            {formatCurrency(caseData.value)}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 pt-2">
          {caseData.tags &&
            caseData.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-400 text-[9px] font-bold uppercase rounded-md border border-slate-100 dark:border-slate-700"
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar size={12} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {formatDate(caseData.started_at)}
          </span>
        </div>
        <button className="flex items-center gap-1 text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest">
          Detalhes
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
