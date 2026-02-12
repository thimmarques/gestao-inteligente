import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { FinanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3 } from 'lucide-react';

interface CashFlowProjectionChartProps {
  records: FinanceRecord[];
}

interface ProjectionPoint {
  month: string;
  receita: number;
  despesa: number;
  saldo: number;
}

export const CashFlowProjectionChart: React.FC<
  CashFlowProjectionChartProps
> = ({ records }) => {
  const projectionData = useMemo(() => {
    const now = new Date();

    // Calculate average monthly income/expense from last 3 months
    let totalRevenue = 0;
    let totalExpense = 0;
    let monthsWithData = 0;

    for (let i = 1; i <= 3; i++) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));

      const monthRevenue = records
        .filter(
          (r) =>
            r.type === 'receita' &&
            r.status === 'pago' &&
            r.paid_date &&
            isWithinInterval(new Date(r.paid_date), {
              start: monthStart,
              end: monthEnd,
            })
        )
        .reduce((sum, r) => sum + r.amount, 0);

      const monthExpense = records
        .filter(
          (r) =>
            r.type === 'despesa' &&
            r.status === 'pago' &&
            r.paid_date &&
            isWithinInterval(new Date(r.paid_date), {
              start: monthStart,
              end: monthEnd,
            })
        )
        .reduce((sum, r) => sum + r.amount, 0);

      if (monthRevenue > 0 || monthExpense > 0) monthsWithData++;
      totalRevenue += monthRevenue;
      totalExpense += monthExpense;
    }

    const avgRevenue = monthsWithData > 0 ? totalRevenue / monthsWithData : 0;
    const avgExpense = monthsWithData > 0 ? totalExpense / monthsWithData : 0;

    // Also capture scheduled future income/expenses
    const data: ProjectionPoint[] = [];

    for (let i = 0; i < 6; i++) {
      const targetMonth = addMonths(now, i);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      const monthLabel = format(targetMonth, 'MMM yyyy', { locale: ptBR });

      // Scheduled revenues (pendente with due_date in this month)
      const scheduledRevenue = records
        .filter(
          (r) =>
            r.type === 'receita' &&
            r.status === 'pendente' &&
            isWithinInterval(new Date(r.due_date), {
              start: monthStart,
              end: monthEnd,
            })
        )
        .reduce((sum, r) => sum + r.amount, 0);

      // Scheduled expenses
      const scheduledExpense = records
        .filter(
          (r) =>
            r.type === 'despesa' &&
            r.status === 'pendente' &&
            isWithinInterval(new Date(r.due_date), {
              start: monthStart,
              end: monthEnd,
            })
        )
        .reduce((sum, r) => sum + r.amount, 0);

      // Use scheduled if available, otherwise use averages
      const projectedRevenue =
        scheduledRevenue > 0 ? scheduledRevenue : avgRevenue;
      const projectedExpense =
        scheduledExpense > 0 ? scheduledExpense : avgExpense;

      data.push({
        month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        receita: Math.round(projectedRevenue),
        despesa: Math.round(projectedExpense),
        saldo: Math.round(projectedRevenue - projectedExpense),
      });
    }

    return data;
  }, [records]);

  return (
    <div className="relative overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-navy-800/40 rounded-[2.5rem] border border-white/30 dark:border-white/10 shadow-2xl p-8">
      {/* Decorative glow */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500 rounded-full opacity-5 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-green-500 rounded-full opacity-5 blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <BarChart3 size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight dark:text-white">
                Projeção de Fluxo de Caixa
              </h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Próximos 6 meses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                Receita
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                Despesa
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 rounded-full bg-blue-500" />
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
                Saldo
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="cashFlowRevenue"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="cashFlowExpense"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#334155"
                opacity={0.08}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#94a3b8',
                  fontSize: 11,
                  fontWeight: 700,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: '#94a3b8',
                  fontSize: 10,
                  fontWeight: 700,
                }}
                tickFormatter={(value) =>
                  `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '1.5rem',
                  color: '#fff',
                  fontSize: '12px',
                  padding: '16px 20px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
                itemStyle={{ padding: '4px 0' }}
                formatter={(value: number) => formatCurrency(value)}
              />

              <Area
                type="monotone"
                dataKey="receita"
                stroke="#22c55e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cashFlowRevenue)"
                name="Receita"
                animationDuration={1500}
                dot={{
                  r: 4,
                  fill: '#22c55e',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 6 }}
              />

              <Area
                type="monotone"
                dataKey="despesa"
                stroke="#ef4444"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cashFlowExpense)"
                name="Despesa"
                animationDuration={1500}
                dot={{
                  r: 4,
                  fill: '#ef4444',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 6 }}
              />

              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#3b82f6"
                strokeWidth={3}
                strokeDasharray="8 8"
                fill="transparent"
                name="Saldo"
                animationDuration={1800}
                dot={{
                  r: 4,
                  fill: '#3b82f6',
                  strokeWidth: 2,
                  stroke: '#fff',
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
