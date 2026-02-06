import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { FinanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ExpensesByCategoryChartProps {
  expenses: FinanceRecord[];
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#fb923c',
  '#dc2626',
  '#f59e0b',
];

export const ExpensesByCategoryChart: React.FC<
  ExpensesByCategoryChartProps
> = ({ expenses }) => {
  const data = useMemo(() => {
    const byCategory = expenses
      .filter((e) => e.status === 'pago')
      .reduce(
        (acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    return Object.entries(byCategory).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [expenses]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="amount"
            nameKey="category"
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '1rem',
              color: '#fff',
            }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
