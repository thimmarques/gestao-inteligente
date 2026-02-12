import React, { useMemo } from 'react';
import {
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { FinanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { addDays, isAfter, isBefore, isThisMonth } from 'date-fns';

interface FinanceHealthCardsProps {
  records: FinanceRecord[];
}

export const FinanceHealthCards: React.FC<FinanceHealthCardsProps> = ({
  records,
}) => {
  const health = useMemo(() => {
    const now = new Date();
    const in30Days = addDays(now, 30);

    const revenues = records.filter((r) => r.type === 'receita');
    const expenses = records.filter((r) => r.type === 'despesa');

    // A Receber (30 dias) — pendente revenue due within 30 days
    const receivable30d = revenues
      .filter((r) => {
        if (r.status !== 'pendente') return false;
        const due = new Date(r.due_date);
        return isAfter(due, now) && isBefore(due, in30Days);
      })
      .reduce((sum, r) => sum + r.amount, 0);

    const receivable30dCount = revenues.filter((r) => {
      if (r.status !== 'pendente') return false;
      const due = new Date(r.due_date);
      return isAfter(due, now) && isBefore(due, in30Days);
    }).length;

    // Inadimplência — overdue / (overdue + pending)
    const overdueRevenues = revenues.filter((r) => r.status === 'vencido');
    const pendingRevenues = revenues.filter((r) => r.status === 'pendente');
    const totalAtRisk = overdueRevenues.length + pendingRevenues.length;
    const defaultRate =
      totalAtRisk > 0 ? (overdueRevenues.length / totalAtRisk) * 100 : 0;
    const overdueAmount = overdueRevenues.reduce((sum, r) => sum + r.amount, 0);

    // Lucratividade Real — paid revenue - paid expense this month
    const paidRevenueMonth = revenues
      .filter(
        (r) =>
          r.status === 'pago' &&
          r.paid_date &&
          isThisMonth(new Date(r.paid_date))
      )
      .reduce((sum, r) => sum + r.amount, 0);

    const paidExpenseMonth = expenses
      .filter(
        (r) =>
          r.status === 'pago' &&
          r.paid_date &&
          isThisMonth(new Date(r.paid_date))
      )
      .reduce((sum, r) => sum + r.amount, 0);

    const profitability = paidRevenueMonth - paidExpenseMonth;
    const profitMargin =
      paidRevenueMonth > 0 ? (profitability / paidRevenueMonth) * 100 : 0;

    return {
      receivable30d,
      receivable30dCount,
      defaultRate,
      overdueAmount,
      overdueCount: overdueRevenues.length,
      profitability,
      profitMargin,
      paidRevenueMonth,
    };
  }, [records]);

  const cards = [
    {
      label: 'A Receber (30 dias)',
      value: formatCurrency(health.receivable30d),
      sub: `${health.receivable30dCount} boleto${health.receivable30dCount !== 1 ? 's' : ''} emitido${health.receivable30dCount !== 1 ? 's' : ''}`,
      icon: Clock,
      accentColor: 'blue',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      glowColor: 'shadow-blue-500/10',
      trend: health.receivable30d > 0 ? 'up' : 'neutral',
    },
    {
      label: 'Inadimplência',
      value: `${health.defaultRate.toFixed(1)}%`,
      sub: `${formatCurrency(health.overdueAmount)} vencido${health.overdueCount !== 1 ? 's' : ''}`,
      icon: AlertCircle,
      accentColor: 'red',
      iconBg:
        health.defaultRate > 10
          ? 'bg-red-500'
          : health.defaultRate > 5
            ? 'bg-amber-500'
            : 'bg-green-500',
      textColor:
        health.defaultRate > 10
          ? 'text-red-600 dark:text-red-400'
          : health.defaultRate > 5
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-green-600 dark:text-green-400',
      glowColor:
        health.defaultRate > 10 ? 'shadow-red-500/10' : 'shadow-green-500/10',
      trend: health.defaultRate > 5 ? 'down' : 'up',
    },
    {
      label: 'Lucratividade Real',
      value: formatCurrency(health.profitability),
      sub: `Margem ${health.profitMargin.toFixed(1)}% do mês`,
      icon: health.profitability >= 0 ? TrendingUp : TrendingDown,
      accentColor: health.profitability >= 0 ? 'green' : 'red',
      iconBg: health.profitability >= 0 ? 'bg-green-500' : 'bg-red-500',
      textColor:
        health.profitability >= 0
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-600 dark:text-red-400',
      glowColor:
        health.profitability >= 0 ? 'shadow-green-500/10' : 'shadow-red-500/10',
      trend: health.profitability >= 0 ? 'up' : 'down',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === 'up' ? ArrowUpRight : ArrowDownRight;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-navy-800/40 p-8 rounded-[2.5rem] border border-white/30 dark:border-white/10 shadow-2xl ${card.glowColor} group hover:scale-[1.02] transition-all duration-300`}
          >
            {/* Decorative glow */}
            <div
              className={`absolute -top-10 -right-10 w-32 h-32 ${card.iconBg} rounded-full opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center text-white shadow-lg shadow-${card.accentColor}-500/20`}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </div>
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    card.trend === 'up'
                      ? 'bg-green-100/80 dark:bg-green-900/30 text-green-600'
                      : card.trend === 'down'
                        ? 'bg-red-100/80 dark:bg-red-900/30 text-red-600'
                        : 'bg-slate-100/80 dark:bg-slate-800/30 text-slate-400'
                  }`}
                >
                  <TrendIcon size={12} strokeWidth={3} />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {card.trend === 'up' ? 'Saudável' : 'Atenção'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] mb-2">
                {card.label}
              </p>
              <h3
                className={`text-3xl font-black tabular-nums tracking-tighter ${card.textColor}`}
              >
                {card.value}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
