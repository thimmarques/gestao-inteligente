
import React, { useState } from 'react';
import { X, Users, Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ReportConfig } from '../../utils/generateFinancialReportPDF';

interface ClientsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => void;
}

export const ClientsReportModal: React.FC<ClientsReportModalProps> = ({
  isOpen, onClose, onGenerate
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    includeRevenues: true,
    includeExpenses: true,
    includeCharts: true,
    includeSummary: true,
    includeOverdue: true,
    format: 'excel'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white tracking-tight">Carteira de Clientes</h2>
                <p className="text-sm font-medium text-slate-500">Métricas demográficas e faturamento</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Calendar size={14} className="text-primary-500" /> Período
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={format(config.startDate, 'yyyy-MM-dd')} onChange={e => setConfig({...config, startDate: new Date(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl dark:text-white text-sm" />
              <input type="date" value={format(config.endDate, 'yyyy-MM-dd')} onChange={e => setConfig({...config, endDate: new Date(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl dark:text-white text-sm" />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <FileSpreadsheet size={14} className="text-primary-500" /> Formato
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <button onClick={() => setConfig({...config, format: 'excel'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${config.format === 'excel' ? 'border-green-600 bg-green-50/50 dark:bg-green-900/20 shadow-lg' : 'border-slate-100 dark:border-slate-800'}`}>
                <FileSpreadsheet size={32} className={config.format === 'excel' ? 'text-green-600' : 'text-slate-400'} />
                <span className="text-xs font-black uppercase tracking-widest dark:text-white">Excel</span>
              </button>
              <button onClick={() => setConfig({...config, format: 'pdf'})} className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${config.format === 'pdf' ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg' : 'border-slate-100 dark:border-slate-800'}`}>
                <FileText size={32} className={config.format === 'pdf' ? 'text-primary-600' : 'text-slate-400'} />
                <span className="text-xs font-black uppercase tracking-widest dark:text-white">PDF</span>
              </button>
            </div>
          </section>
        </div>

        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button onClick={() => onGenerate(config)} className="flex items-center gap-3 px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/20 active:scale-95">
            <Download size={24} />
            Exportar Clientes
          </button>
        </div>
      </div>
    </div>
  );
};
