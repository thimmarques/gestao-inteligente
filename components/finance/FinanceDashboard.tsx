import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  Users,
  AlertCircle,
  Info,
} from 'lucide-react';
import { FinanceRecord, Client } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { isThisMonth } from 'date-fns';

interface FinanceDashboardProps {
  revenues: FinanceRecord[];
  expenses: FinanceRecord[];
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  revenues,
  expenses,
}) => {
  const stats = useMemo(() => {
    const clients: Client[] = JSON.parse(
      localStorage.getItem('legalflow_clients') || '[]'
    );

    const paidRevenues = revenues.filter(
      (r) =>
        r.status === 'pago' && r.paid_date && isThisMonth(new Date(r.paid_date))
    );
    const paidExpenses = expenses.filter(
      (e) =>
        e.status === 'pago' && e.paid_date && isThisMonth(new Date(e.paid_date))
    );

    const totalRev = paidRevenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExp = paidExpenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalRev - totalExp;

    const mrr = clients
      .filter((c) => c.type === 'particular' && c.status === 'ativo')
      .reduce((sum, c) => sum + (c.financial_profile?.retainer_fee || 0), 0);

    const particularClients = clients.filter((c) => c.type === 'particular');
    const avgTicket =
      particularClients.length > 0 ? totalRev / particularClients.length : 0;

    const overdueAmount = revenues
      .filter((r) => r.status === 'vencido')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalPending = revenues
      .filter((r) => ['pendente', 'vencido'].includes(r.status))
      .reduce((sum, r) => sum + r.amount, 0);
    const defaultRate =
      totalPending > 0 ? (overdueAmount / totalPending) * 100 : 0;

    return {
      totalRev,
      totalExp,
      balance,
      mrr,
      avgTicket,
      defaultRate,
      overdueAmount,
      totalPending,
    };
  }, [revenues, expenses]);

  const cards = [
    {
      label: 'Saldo do Mês',
      value: formatCurrency(stats.balance),
      icon:
        stats.balance >= 0 ? (
          <TrendingUp size={24} />
        ) : (
          <TrendingDown size={24} />
        ),
      color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600',
      bg: 'bg-white dark:bg-navy-800/50',
      sub: 'Receitas - Despesas efetivadas',
    },
    {
      label: 'Receita Recorrente (MRR)',
      value: formatCurrency(stats.mrr),
      icon: <Repeat size={24} />,
      color: 'text-primary-600',
      bg: 'bg-white dark:bg-navy-800/50',
      tooltip: 'Soma dos contratos de honorários fixos mensais',
      sub: 'Base estável do escritório',
    },
    {
      label: 'Ticket Médio',
      value: formatCurrency(stats.avgTicket),
      icon: <Users size={24} />,
      color: 'text-purple-600',
      bg: 'bg-white dark:bg-navy-800/50',
      sub: 'Média por cliente particular',
    },
    {
      label: 'Taxa de Inadimplência',
      value: `${stats.defaultRate.toFixed(1)}%`,
      icon: <AlertCircle size={24} />,
      color:
        stats.defaultRate > 10
          ? 'text-red-600'
          : stats.defaultRate > 5
            ? 'text-amber-600'
            : 'text-green-600',
      bg: 'bg-white dark:bg-navy-800/50',
      sub: `R$ ${stats.overdueAmount.toLocaleString()} vencidos`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`${card.bg} p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-white/5 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-110 transition-transform" />

          <header className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {card.label}
            </span>
            <div
              className={`${card.color} opacity-60 group-hover:opacity-100 transition-opacity`}
            >
              {card.icon}
            </div>
          </header>

          <div className="space-y-1">
            <h3
              className={`text-2xl font-black tabular-nums tracking-tighter ${card.color}`}
            >
              {card.value}
            </h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              {card.sub}
              {card.tooltip && <Info size={12} className="cursor-help" />}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
