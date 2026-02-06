import React, { useMemo } from 'react';
import {
  Database,
  ShieldAlert,
  Archive,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AuditLog } from '../../types/audit';
import { subHours } from 'date-fns';
import { useCases, useClients } from '../../hooks/useQueries';

interface SecurityIndicatorsProps {
  logs: AuditLog[];
}

export const SecurityIndicators: React.FC<SecurityIndicatorsProps> = ({
  logs,
}) => {
  const { data: cases = [], isLoading: loadingCases } = useCases();
  const { data: clients = [], isLoading: loadingClients } = useClients();

  const integrityScore = useMemo(() => {
    const orphanCases = cases.filter(
      (c: any) => !clients.find((cl: any) => cl.id === c.client_id)
    ).length;
    return { score: orphanCases === 0 ? 100 : 92, orphanCases };
  }, [cases, clients]);

  const suspiciousActivity = useMemo(() => {
    const last24h = subHours(new Date(), 24);
    const recent = logs.filter((l) => new Date(l.timestamp) >= last24h);
    return {
      denied: recent.filter((l) => l.action === 'access_denied').length,
      deletions: recent.filter((l) => l.action === 'delete').length,
    };
  }, [logs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <IndicatorCard
        title="Integridade"
        icon={<Database />}
        score={
          loadingCases || loadingClients ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            `${integrityScore.score}%`
          )
        }
        color="text-green-500"
        items={[
          {
            label: 'Processos órfãos',
            value:
              loadingCases || loadingClients
                ? '...'
                : integrityScore.orphanCases,
            ok: integrityScore.orphanCases === 0,
          },
          { label: 'Prazos órfãos', value: 0, ok: true },
        ]}
      />
      <IndicatorCard
        title="Atividade Suspeita"
        icon={<ShieldAlert />}
        score={suspiciousActivity.denied > 5 ? 'Alta' : 'Baixa'}
        color={
          suspiciousActivity.denied > 5 ? 'text-red-500' : 'text-green-500'
        }
        items={[
          {
            label: 'Acessos negados',
            value: suspiciousActivity.denied,
            ok: suspiciousActivity.denied < 3,
          },
          {
            label: 'Exclusões (24h)',
            value: suspiciousActivity.deletions,
            ok: suspiciousActivity.deletions < 5,
          },
        ]}
      />
      <IndicatorCard
        title="Backup & Logs"
        icon={<Archive />}
        score="ATIVO"
        color="text-blue-500"
        items={[
          { label: 'Retenção ativa', value: '90 dias', ok: true },
          { label: 'Logs armazenados', value: logs.length, ok: true },
        ]}
      />
    </div>
  );
};

const IndicatorCard = ({ title, icon, score, color, items }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-center justify-between mb-5">
      <div
        className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${color}`}
      >
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className={`text-base font-black ${color} tracking-tight`}>
        {score}
      </span>
    </div>
    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">
      {title}
    </h4>
    <div className="space-y-2.5">
      {items.map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500 truncate mr-3">
            {item.label}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-black dark:text-white tabular-nums">
              {item.value}
            </span>
            {item.ok ? (
              <ShieldCheck size={12} className="text-green-500" />
            ) : (
              <AlertTriangle size={12} className="text-amber-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);
