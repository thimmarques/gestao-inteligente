import React, { useState, useMemo, useEffect } from 'react';
import {
  FileSearch,
  Download,
  Activity,
  AlertTriangle,
  Search,
  ChevronDown,
  RefreshCw,
  ShieldCheck,
  History,
  List,
  Layers,
  Eye,
  Loader2,
} from 'lucide-react';
import { AuditLog, AuditEntityType } from '../../types/audit.ts';
import { format, isAfter, subDays, startOfDay, subHours } from 'date-fns';

import { LogDiffView } from './LogDiffView.tsx';
import { ExportLogsModal } from './ExportLogsModal.tsx';
import { SecurityIndicators } from './SecurityIndicators.tsx';
import { LogsTimeline } from './LogsTimeline.tsx';
import { LogsStatistics } from './LogsStatistics.tsx';
import {
  checkSecurityAlerts,
  SecurityAlert,
} from '../../utils/securityAlerts.ts';
import { generateAuditReportPDF } from '../../utils/generateAuditReportPDF.ts';
import { useAuditLogs } from '../../hooks/useQueries';
import { useApp } from '../../contexts/AppContext';
import { settingsConfig } from '../../utils/settingsConfig';

type LogSection = 'all' | AuditEntityType;

export const LogsTab: React.FC = () => {
  const { lawyer } = useApp();
  console.log('LogsTab: lawyer context', lawyer);
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useAuditLogs(lawyer?.office_id);
  console.log('LogsTab: useAuditLogs result', {
    logs,
    isLoading,
    officeId: lawyer?.office_id,
  });
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [selectedSection, setSelectedSection] = useState<LogSection>('all');
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState('all');

  const securityAlerts = useMemo(() => checkSecurityAlerts(logs), [logs]);

  const sections: { id: LogSection; label: string }[] = [
    { id: 'all', label: 'Todos os Registros' },
    { id: 'client', label: 'Clientes' },
    { id: 'case', label: 'Processos' },
    { id: 'deadline', label: 'Prazos' },
    { id: 'finance', label: 'Financeiro' },
    { id: 'team', label: 'Equipe' },
    { id: 'system', label: 'Sistema' },
  ];

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const searchableText = [l.lawyer_name, l.entity_description, l.action]
        .join(' ')
        .toLowerCase();

      const matchSearch = searchableText.includes(searchTerm.toLowerCase());
      const matchSection =
        selectedSection === 'all' || l.entity_type === selectedSection;

      const logDate = new Date(l.created_at || l.timestamp);
      let matchPeriod = true;
      if (period === 'today')
        matchPeriod = isAfter(logDate, startOfDay(new Date()));
      else if (period === '7d')
        matchPeriod = isAfter(logDate, subDays(new Date(), 7));

      return matchSearch && matchSection && matchPeriod;
    });
  }, [logs, searchTerm, selectedSection, period]);

  const handleExportContextual = async () => {
    // Exporta apenas o que está sendo visto no momento
    const config = {
      startDate: subDays(new Date(), 90),
      endDate: new Date(),
      filters: { section: selectedSection },
      includeTechnicalDetails: true,
      includeStatistics: true,
      includeDiffDetails: true,
    };
    await generateAuditReportPDF(config, filteredLogs);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Indicadores Visuais Ajustados */}
      <SecurityIndicators logs={logs} />

      {/* Header com Troca de Logs */}
      <div className={settingsConfig.cardClass}>
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-950 text-white rounded-xl dark:bg-primary-600">
              <FileSearch size={20} />
            </div>
            <div>
              <h2 className={settingsConfig.sectionTitleClass}>Audit Log</h2>
              <div className="relative mt-1">
                <button
                  onClick={() => setIsSectionMenuOpen(!isSectionMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Layers size={12} />
                  Visualizando:{' '}
                  <span className="text-primary-600">
                    {sections.find((s) => s.id === selectedSection)?.label}
                  </span>
                  <ChevronDown size={12} />
                </button>

                {isSectionMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 animate-in zoom-in-95">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelectedSection(s.id);
                          setIsSectionMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold transition-colors ${selectedSection === s.id ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 xl:flex-none">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Buscar no log..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full xl:w-64 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs focus:ring-2 focus:ring-primary-500 dark:text-white"
              />
            </div>
            <button
              onClick={handleExportContextual}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 text-white dark:bg-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              <Download size={14} /> Exportar
            </button>
            <button
              onClick={() => refetch()}
              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-primary-600"
            >
              <RefreshCw
                size={16}
                className={isLoading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>
      </div>

      <LogsStatistics logs={filteredLogs} />

      {/* Main View Area */}
      <div className={settingsConfig.cardClass + ' p-0 overflow-hidden'}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Registros Cronológicos
          </h3>
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-700 text-primary-600' : 'text-slate-400'}`}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-slate-100 dark:bg-slate-700 text-primary-600' : 'text-slate-400'}`}
            >
              <History size={14} />
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Data/Hora
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Seção
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Ação
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Detalhes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2
                        size={24}
                        className="animate-spin text-primary-600 mx-auto mb-2"
                      />
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Carregando registros de auditoria...
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() =>
                          setExpandedLogId(
                            expandedLogId === log.id ? null : log.id
                          )
                        }
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer group transition-colors"
                      >
                        <td className="px-6 py-3">
                          <span className="text-[11px] font-bold dark:text-slate-300 tabular-nums">
                            {format(
                              new Date(log.created_at || log.timestamp),
                              'dd/MM HH:mm'
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-black uppercase text-slate-400">
                            {log.entity_type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-black uppercase dark:text-white">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium dark:text-slate-400 truncate max-w-xs block">
                            {log.entity_description}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Eye
                            size={14}
                            className="ml-auto text-slate-300 group-hover:text-primary-500 transition-colors"
                          />
                        </td>
                      </tr>
                      {expandedLogId === log.id && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 bg-slate-50/50 dark:bg-slate-950/40 border-y border-slate-100 dark:border-slate-800"
                          >
                            <LogDiffView details={log.details || '{}'} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <LogsTimeline logs={filteredLogs} onExpand={setExpandedLogId} />
          </div>
        )}
      </div>
    </div>
  );
};
