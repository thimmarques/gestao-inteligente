import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import { useFinancesByCase } from '../../../hooks/useQueries';

interface FinanceTabProps {
  caseId: string;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ caseId }) => {
  const { data: records = [], isLoading } = useFinancesByCase(caseId);

  const totalRevenue = records
    .filter((r) => r.type === 'receita')
    .reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = records
    .filter((r) => r.type === 'despesa')
    .reduce((acc, r) => acc + r.amount, 0);
  const balance = totalRevenue - totalExpense;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Total Receitas
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600 tracking-tight">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
              <TrendingDown size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Total Despesas
            </span>
          </div>
          <p className="text-3xl font-bold text-red-600 tracking-tight">
            {formatCurrency(totalExpense)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
              <DollarSign size={20} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Saldo Processo
            </span>
          </div>
          <p
            className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Tipo
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Categoria
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Valor
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2
                      size={32}
                      className="animate-spin text-primary-600 mx-auto mb-2"
                    />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Carregando dados...
                    </p>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.type === 'receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                      >
                        {r.type === 'receita' ? (
                          <ArrowUpRight size={16} />
                        ) : (
                          <ArrowDownRight size={16} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium dark:text-white">
                      {r.category}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold tabular-nums ${r.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {r.type === 'receita' ? '+' : '-'}{' '}
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(r.due_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'pago'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                            : r.status === 'vencido'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-20 text-center text-slate-500"
                  >
                    Nenhuma transação vinculada a este processo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
