
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const StatusBarChart: React.FC = () => {
  const chartData = useMemo(() => {
    const cases = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
    const counts: Record<string, number> = {};
    
    cases.forEach((c: any) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });

    const colors: Record<string, string> = {
      'distribuído': '#64748b',
      'andamento': '#3b82f6',
      'sentenciado': '#8b5cf6',
      'recurso': '#f97316',
      'arquivado': '#eab308',
      'encerrado': '#22c55e'
    };

    return Object.entries(counts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      color: colors[status.toLowerCase()] || '#94a3b8'
    }));
  }, []);

  const total = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">
        Distribuição por Status
      </h3>
      <div className="h-[300px] w-full">
        {total > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="status" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`, 
                  'Processos'
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">
            Sem processos cadastrados para exibir.
          </div>
        )}
      </div>
    </div>
  );
};
