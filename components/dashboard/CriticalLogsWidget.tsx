import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  Trash2,
  Shield,
  Lock,
  AlertTriangle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AuditLog } from '../../types/audit.ts';
import { formatDistanceToNow, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuditLogs } from '../../hooks/useQueries';
import { useApp } from '../../contexts/AppContext';

export const CriticalLogsWidget: React.FC = () => {
  const { lawyer } = useApp();
  const { data: logs = [], isLoading } = useAuditLogs(lawyer?.office_id);

  const criticalLogs = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);

    return logs
      .filter(
        (l: any) =>
          l.criticality === 'crítico' &&
          new Date(l.created_at || l.timestamp) >= sevenDaysAgo
      )
      .slice(0, 8);
  }, [logs]);

  const getActionIcon = (action: string) => {
    if (action === 'delete')
      return <Trash2 className="text-red-500" size={16} />;
    if (action === 'permission_change')
      return <Lock className="text-purple-500" size={16} />;
    if (action === 'access_denied')
      return <ShieldAlert className="text-orange-500" size={16} />;
    return <AlertTriangle className="text-red-400" size={16} />;
  };

  return (
    <div className="glass-card rounded-3xl soft-shadow h-[340px] flex flex-col group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

      <header className="p-8 pb-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl shadow-sm ring-1 ring-red-100 dark:ring-red-900/30">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold dark:text-white tracking-tight text-slate-800">
              Alertas Críticos
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Segurança
            </p>
          </div>
        </div>
        {criticalLogs.length > 0 && (
          <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-red-200 dark:shadow-none animate-pulse">
            {criticalLogs.length}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 relative z-10">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 size={24} className="animate-spin text-red-200 mb-2" />
          </div>
        ) : criticalLogs.length > 0 ? (
          <div className="space-y-1">
            {criticalLogs.map((log: any) => (
              <Link
                key={log.id}
                to={`/settings?tab=logs&id=${log.id}`}
                className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group/item"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 p-2 bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-slate-100 dark:border-white/15 group-hover/item:scale-105 transition-transform">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold dark:text-white truncate text-slate-700">
                      {log.lawyer_name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                      {log.entity_description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-medium text-slate-400">
                    {formatDistanceToNow(
                      new Date(log.created_at || log.timestamp),
                      { addSuffix: true, locale: ptBR }
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <ShieldCheck size={48} className="text-green-500 mb-4 opacity-50" />
            <p className="text-sm font-bold dark:text-white text-slate-700">
              Tudo Seguro
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
              Nenhum evento crítico
            </p>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/[0.06] flex justify-center">
        <Link
          to="/settings?tab=logs"
          className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest hover:gap-3 transition-all p-2"
        >
          Central de Auditoria
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
