
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FinanceRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RevenueByClientTypeChartProps {
  revenues: FinanceRecord[];
}

export const RevenueByClientTypeChart: React.FC<RevenueByClientTypeChartProps> = ({ revenues }) => {
  const data = useMemo(() => {
    const particular = revenues
      .filter(r => (r.client as any)?.type === 'particular' && r.status === 'pago')
      .reduce((sum, r) => sum + r.amount, 0);

    const defensoria = revenues
      .filter(r => (r.client as any)?.type === 'defensoria' && r.status === 'pago')
      .reduce((sum, r) => sum + r.amount, 0);

    const chartData: { type: string; amount: number; color: string }[] = [
      { type: 'Particular', amount: particular, color: '#3b82f6' },
      { type: 'Defensoria', amount: defensoria, color: '#22c55e' }
    ];

    return chartData;
  }, [revenues]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
        <XAxis
          dataKey="type"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
        />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
