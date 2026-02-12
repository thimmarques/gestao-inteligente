import React from 'react';
import { Building, Calendar, ArrowRight, Scale } from 'lucide-react';
import { Case } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CaseCardProps {
  caseData: Case;
  onClick: () => void;
}

const statusColorMap: Record<string, string> = {
  distribuído:
    'bg-slate-100 text-slate-700 dark:bg-navy-800 dark:text-slate-400',
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
      className="bg-white dark:bg-navy-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col h-full"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-sm font-bold text-primary-600 truncate max-w-[150px]">
          {caseData.process_number}
        </span>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColorMap[caseData.status.toLowerCase()] || 'bg-slate-100'}`}
        >
          {caseData.status}
        </span>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-sm font-bold dark:text-white border border-slate-200 dark:border-white/15">
            {caseData.client_id.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold dark:text-white truncate">
              Cliente {caseData.client_id}
            </p>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1">
              <Building size={12} />
              {caseData.court}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Scale
            size={14}
            className={
              typeColorMap[caseData.type.toLowerCase()] || 'text-slate-400'
            }
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${typeColorMap[caseData.type.toLowerCase()] || 'text-slate-500'}`}
          >
            Área: {caseData.type}
          </span>
        </div>

        {caseData.value > 0 && (
          <p className="text-sm font-bold dark:text-white">
            {formatCurrency(caseData.value)}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {caseData.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-slate-50 dark:bg-navy-800 text-slate-500 text-[10px] rounded border border-slate-100 dark:border-white/15"
            >
              {tag}
            </span>
          ))}
          {caseData.tags.length > 3 && (
            <span className="text-[10px] text-slate-400">
              +{caseData.tags.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-white/10 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Calendar size={12} />
          <span className="text-[10px] font-medium uppercase">
            {formatDate(caseData.started_at)}
          </span>
        </div>
        <button className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
          Detalhes
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
