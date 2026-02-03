
import React, { useMemo } from 'react';
import { Clock, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { FinanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { isThisMonth } from 'date-fns';

interface RevenueCardsProps {
  revenues: FinanceRecord[];
}

export const RevenueCards: React.FC<RevenueCardsProps> = ({ revenues }) => {
  const stats = useMemo(() => {
    const pending = revenues.filter(r => r.status === 'pendente');
    const paid = revenues.filter(r => r.status === 'pago' && r.paid_date && isThisMonth(new Date(r.paid_date)));
    const overdue = revenues.filter(r => r.status === 'vencido');

    return {
      pendingSum: pending.reduce((sum, r) => sum + r.amount, 0),
      pendingCount: pending.length,
      paidSum: paid.reduce((sum, r) => sum + r.amount, 0),
      overdueSum: overdue.reduce((sum, r) => sum + r.amount, 0),
      overdueCount: overdue.length
    };
  }, [revenues]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-blue-500/10 dark:bg-blue-500/5 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 shadow-sm group hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Clock size={20} />
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">A Receber</span>
        </div>
        <p className="text-3xl font-black text-blue-700 dark:text-blue-300 tabular-nums">{formatCurrency(stats.pendingSum)}</p>
        <p className="text-[10px] font-bold text-blue-500 uppercase mt-1 tracking-widest">{stats.pendingCount} lançamentos pendentes</p>
      </div>

      <div className="bg-green-500/10 dark:bg-green-500/5 p-6 rounded-[2rem] border border-green-100 dark:border-green-900/30 shadow-sm group hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            <CheckCircle2 size={20} />
          </div>
          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">Recebido (Mês)</span>
        </div>
        <p className="text-3xl font-black text-green-700 dark:text-green-300 tabular-nums">{formatCurrency(stats.paidSum)}</p>
        <p className="text-[10px] font-bold text-green-500 uppercase mt-1 tracking-widest">Saldo efetivado hoje</p>
      </div>

      <div className="bg-red-500/10 dark:bg-red-500/5 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 shadow-sm group hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <AlertTriangle size={20} />
          </div>
          <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Vencido</span>
        </div>
        <p className="text-3xl font-black text-red-700 dark:text-red-300 tabular-nums">{formatCurrency(stats.overdueSum)}</p>
        <p className="text-[10px] font-bold text-red-500 uppercase mt-1 tracking-widest">{stats.overdueCount} clientes em atraso</p>
      </div>
    </div>
  );
};
