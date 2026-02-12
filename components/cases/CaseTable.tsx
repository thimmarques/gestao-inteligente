import React from 'react';
import { MoreVertical, User } from 'lucide-react';
import { CaseWithRelations } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CaseTableProps {
  cases: CaseWithRelations[];
  onRowClick: (caseId: string) => void;
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
  cível: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  trabalhista:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  criminal:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  família:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tributário:
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  administrativo:
    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  previdenciário:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export const CaseTable: React.FC<CaseTableProps> = ({ cases, onRowClick }) => {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm glass-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-navy-800/50 border-b border-slate-100 dark:border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Número
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Cliente
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Área / Tipo
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                Valor
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {cases.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  Nenhum processo encontrado
                </td>
              </tr>
            ) : (
              cases.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  onClick={() => onRowClick(c.id)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-primary-600 group-hover:underline">
                      {c.process_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-navy-800 flex items-center justify-center text-[10px] font-black text-primary-600 border border-primary-100 dark:border-white/10 uppercase">
                        {c.client?.name?.charAt(0) || <User size={12} />}
                      </div>
                      <span className="font-bold text-sm dark:text-white truncate max-w-[200px]">
                        {c.client?.name || 'Cliente não identificado'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border border-transparent ${typeColorMap[c.type.toLowerCase()] || 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusColorMap[c.status.toLowerCase()] || 'bg-slate-100'}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black dark:text-slate-200 tabular-nums">
                    {formatCurrency(c.value)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div
                      className="flex items-center justify-end gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="p-2 text-slate-300 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
