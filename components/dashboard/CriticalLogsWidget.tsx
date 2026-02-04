
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ChevronRight, Trash2, Shield, Lock, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
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
      .filter((l: any) => l.criticality === 'crítico' && new Date(l.created_at || l.timestamp) >= sevenDaysAgo)
      .slice(0, 8);
  }, [logs]);

  const getActionIcon = (action: string) => {
    if (action === 'delete') return <Trash2 className="text-red-500" size={18} />;
    if (action === 'permission_change') return <Lock className="text-purple-500" size={18} />;
    if (action === 'access_denied') return <ShieldAlert className="text-orange-500" size={18} />;
    return <AlertTriangle className="text-red-400" size={18} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm h-[320px] flex flex-col group overflow-hidden">
      <header className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Alertas Críticos</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Segurança & Auditoria</p>
          </div>
        </div>
        {criticalLogs.length > 0 && (
          <span className="px-2 py-0.5 bg-red-500 text-white rounded-md text-[10px] font-black animate-pulse">
            {criticalLogs.length} RECENTES
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 size={24} className="animate-spin text-primary-600 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verificando logs...</p>
          </div>
        ) : criticalLogs.length > 0 ? (
          <div className="space-y-1">
            {criticalLogs.map((log: any) => (
              <Link
                key={log.id}
                to={`/settings?tab=logs&id=${log.id}`}
                className="flex items-center justify-between p-3 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 group/item"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover/item:scale-110 transition-transform">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black dark:text-white truncate uppercase tracking-tighter">
                      {log.lawyer_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate leading-tight">
                      {log.entity_description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">
                    {formatDistanceToNow(new Date(log.created_at || log.timestamp), { addSuffix: true, locale: ptBR })}
                  </p>
                  <ChevronRight size={14} className="ml-auto text-slate-200 group-hover/item:text-red-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <ShieldCheck size={48} className="text-green-500 mb-2" />
            <p className="text-sm font-bold dark:text-white">Nenhum evento crítico</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Sistema operando normalmente</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <Link
          to="/settings?tab=logs"
          className="flex items-center justify-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] hover:gap-3 transition-all"
        >
          Central de Auditoria
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
