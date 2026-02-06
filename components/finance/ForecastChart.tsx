import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
} from 'recharts';
import { ForecastMonth } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ForecastChartProps {
  forecastData: ForecastMonth[];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  forecastData,
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={forecastData}
        margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#334155"
          opacity={0.1}
        />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
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
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
          itemStyle={{ padding: '4px 0' }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Legend
          verticalAlign="top"
          align="right"
          height={60}
          iconType="circle"
          formatter={(value) => (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
              {value}
            </span>
          )}
        />

        <Area
          type="monotone"
          dataKey="projected_revenue"
          stroke="#22c55e"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorRevenue)"
          name="Receita Projetada"
          animationDuration={2000}
        />

        <Area
          type="monotone"
          dataKey="projected_expenses"
          stroke="#ef4444"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorExpense)"
          name="Despesa Projetada"
          animationDuration={2000}
        />

        {/* Usando Area com dot para simular linha de saldo em Recharts AreaChart */}
        <Area
          type="monotone"
          dataKey="projected_balance"
          stroke="#3b82f6"
          strokeWidth={3}
          strokeDasharray="8 8"
          fill="transparent"
          name="Saldo Projetado"
          dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
