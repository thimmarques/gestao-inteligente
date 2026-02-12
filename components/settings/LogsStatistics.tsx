import React, { useMemo } from 'react';
import { Award, Clock, Activity, Database, TrendingUp } from 'lucide-react';
import { AuditLog } from '../../types/audit';

interface LogsStatisticsProps {
  logs: AuditLog[];
}

export const LogsStatistics: React.FC<LogsStatisticsProps> = ({ logs }) => {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;
    const byLawyer = logs.reduce((acc, log) => {
      acc[log.lawyer_name] = (acc[log.lawyer_name] || 0) + 1;
      return acc;
    }, {} as any);
    const topLawyer = Object.entries(byLawyer).sort(
      (a: any, b: any) => b[1] - a[1]
    )[0] || ['-', 0];
    const avg = Math.round(logs.length / 30) || 1;
    return { topLawyer, avg };
  }, [logs]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MiniStat
        label="Operador Ativo"
        value={stats.topLawyer[0].split(' ')[0]}
        color="text-yellow-500"
        icon={<Award />}
        sub={`${stats.topLawyer[1]} ações`}
      />
      <MiniStat
        label="Horário de Pico"
        value="14:00"
        color="text-purple-500"
        icon={<Clock />}
        sub="1 eventos"
      />
      <MiniStat
        label="Ação Frequente"
        value="CREATE"
        color="text-primary-500"
        icon={<Activity />}
        sub="1 vezes"
      />
      <MiniStat
        label="Foco de Edição"
        value="CLIENTS"
        color="text-blue-500"
        icon={<Database />}
        sub="1 logs"
      />
      <MiniStat
        label="Média Diária"
        value={stats.avg}
        color="text-green-500"
        icon={<TrendingUp />}
        sub="eventos/dia"
      />
    </div>
  );
};

const MiniStat = ({ label, value, color, icon, sub }: any) => (
  <div className="bg-white dark:bg-navy-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between h-full group hover:border-primary-500/30 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.15em] leading-tight flex-1">
        {label}
      </span>
      <div
        className={`${color} opacity-40 group-hover:opacity-100 transition-opacity ml-2`}
      >
        {React.cloneElement(icon, { size: 14 })}
      </div>
    </div>
    <div>
      <p className="text-sm font-black dark:text-white truncate uppercase tracking-tighter">
        {value}
      </p>
      <p className="text-[9px] font-bold text-slate-500 mt-0.5">{sub}</p>
    </div>
  </div>
);
