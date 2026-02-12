import React from 'react';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SuccessRateCardProps {
  casesWon: number;
  casesLost: number;
}

export const SuccessRateCard: React.FC<SuccessRateCardProps> = ({
  casesWon,
  casesLost,
}) => {
  const total = casesWon + casesLost;
  const successRate = total > 0 ? Math.round((casesWon / total) * 100) : 0;

  const data =
    total > 0
      ? [
          { name: 'Ganhos', value: casesWon, color: '#22c55e' },
          { name: 'Perdidos', value: casesLost, color: '#ef4444' },
        ]
      : [{ name: 'Sem dados', value: 1, color: '#e2e8f0' }];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-navy-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Taxa de Sucesso
        </span>
        <TrendingUp className="text-green-500" size={20} />
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 tracking-tight">
            {successRate}%
          </div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {total > 0
              ? `${casesWon} ganhos de ${total} concluídos`
              : 'Nenhum processo concluído'}
          </p>
        </div>

        <div className="w-20 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
