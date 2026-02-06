import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

export const TypePieChart: React.FC = () => {
  const chartData = useMemo(() => {
    const cases = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
    const counts: Record<string, number> = {};

    cases.forEach((c: any) => {
      counts[c.type] = (counts[c.type] || 0) + 1;
    });

    const COLORS = [
      '#3b82f6',
      '#22c55e',
      '#ef4444',
      '#f59e0b',
      '#ec4899',
      '#eab308',
      '#8b5cf6',
    ];

    return Object.entries(counts).map(([type, count], index) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
      color: COLORS[index % COLORS.length],
    }));
  }, []);

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
        Distribuição por Tipo
      </h3>
      <div className="h-[300px] w-full">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="type"
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconSize={10}
                formatter={(value) => (
                  <span className="text-xs font-bold dark:text-slate-400 ml-2 mb-3 inline-block leading-none">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
            Sem dados de processos para exibir.
          </div>
        )}
      </div>
    </div>
  );
};
