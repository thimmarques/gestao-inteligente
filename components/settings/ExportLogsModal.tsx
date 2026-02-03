
import React, { useState } from 'react';
import { X, Download, Calendar, FileText, FileSpreadsheet, FileCode, Check, Loader2, Info } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AuditLog } from '../../types/audit';
import { logAction } from '../../utils/auditLogger';
import { generateAuditReportPDF, AuditReportConfig } from '../../utils/generateAuditReportPDF';

interface ExportLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
}

export const ExportLogsModal: React.FC<ExportLogsModalProps> = ({ isOpen, onClose, logs }) => {
  const [formatType, setFormatType] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [filters, setFilters] = useState({
    onlyCritical: false,
    includeTechnical: true
  });

  if (!isOpen) return null;

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    // Filtrar logs para exportação
    const filteredLogs = logs.filter(l => {
      const date = new Date(l.timestamp);
      const isWithinDate = date >= new Date(dateRange.start) && date <= new Date(dateRange.end + 'T23:59:59');
      const isCriticalMatch = !filters.onlyCritical || l.criticality === 'crítico';
      return isWithinDate && isCriticalMatch;
    });

    try {
      if (formatType === 'json') {
        setStepLabel('Gerando arquivo JSON...');
        setProgress(50);
        await sleep(500);
        const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${format(new Date(), 'dd-MM-yyyy')}.json`;
        link.click();
      } else if (formatType === 'csv') {
        setStepLabel('Formatando dados em CSV...');
        setProgress(50);
        await sleep(500);
        const headers = ['Timestamp', 'Advogado', 'Ação', 'Entidade', 'Descrição', 'Criticidade', 'IP', 'User Agent'];
        const rows = filteredLogs.map(l => [
          format(new Date(l.timestamp), 'dd/MM/yyyy HH:mm:ss'),
          l.lawyer_name,
          l.action,
          l.entity_type,
          `"${l.entity_description}"`,
          l.criticality,
          l.ip_address,
          `"${l.user_agent}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_logs_${format(new Date(), 'dd-MM-yyyy')}.csv`;
        link.click();
      } else if (formatType === 'pdf') {
        setStepLabel('Coletando logs...');
        setProgress(20);
        await sleep(400);
        
        setStepLabel('Calculando estatísticas...');
        setProgress(40);
        await sleep(600);
        
        setStepLabel('Gerando PDF Profissional...');
        setProgress(70);
        await sleep(300);

        const config: AuditReportConfig = {
          startDate: new Date(dateRange.start),
          endDate: new Date(dateRange.end),
          filters: {
            includeNormal: true,
            includeImportante: true,
            includeCritico: true,
            types: [],
            entities: []
          },
          includeTechnicalDetails: filters.includeTechnical,
          includeStatistics: true,
          includeDiffDetails: true
        };

        await generateAuditReportPDF(config, filteredLogs);
      }

      setProgress(100);
      setStepLabel('Concluído!');
      await sleep(500);
      alert(`${filteredLogs.length} registros exportados com sucesso.`);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar exportação.');
    } finally {
      setIsExporting(false);
      setProgress(0);
      setStepLabel('');
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Exportar Auditoria</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configurações de Relatório</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          {isExporting ? (
            <div className="py-10 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-100 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-primary-600">{progress}%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold dark:text-white uppercase tracking-widest animate-pulse">{stepLabel}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">Não feche esta janela</p>
              </div>
            </div>
          ) : (
            <>
              {/* Período */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Período dos Logs
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={e => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm dark:text-white" 
                  />
                  <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={e => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm dark:text-white" 
                  />
                </div>
              </div>

              {/* Formato */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Formato do Arquivo</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'csv', label: 'CSV', icon: FileSpreadsheet, color: 'text-green-600' },
                    { id: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-600' },
                    { id: 'json', label: 'JSON', icon: FileCode, color: 'text-blue-600' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFormatType(f.id as any)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        formatType === f.id ? 'border-primary-600 bg-primary-50/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <f.icon size={24} className={f.color} />
                      <span className="text-[10px] font-black uppercase">{f.label}</span>
                      {formatType === f.id && <Check size={12} className="text-primary-600" strokeWidth={4} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtros Extras */}
              <div className="space-y-3">
                 <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.onlyCritical}
                      onChange={e => setFilters({...filters, onlyCritical: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <div className="space-y-0.5">
                       <p className="text-xs font-bold dark:text-white">Apenas eventos críticos</p>
                       <p className="text-[9px] text-slate-400 uppercase">Deleções e mudanças de acesso</p>
                    </div>
                 </label>
                 
                 <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.includeTechnical}
                      onChange={e => setFilters({...filters, includeTechnical: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <div className="space-y-0.5">
                       <p className="text-xs font-bold dark:text-white">Incluir detalhes técnicos</p>
                       <p className="text-[9px] text-slate-400 uppercase">IP, Dispositivo e Navegador</p>
                    </div>
                 </label>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                 <Info className="text-blue-600 shrink-0" size={16} />
                 <p className="text-[10px] text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
                   Este relatório contém dados sensíveis de rastreabilidade. Certifique-se de armazená-lo em local seguro após o download.
                 </p>
              </div>

              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="w-full py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Download size={24} />
                Iniciar Exportação
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
