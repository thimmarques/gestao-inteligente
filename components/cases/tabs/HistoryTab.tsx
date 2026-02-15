import React from 'react';
import { History, Loader2, FileDown } from 'lucide-react';
import { useAuditLogsByEntity, useCase } from '../../../hooks/useQueries';
import { generateCaseHistoryPDF } from '../../../utils/generateCaseHistoryPDF';

interface HistoryTabProps {
  caseId: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ caseId }) => {
  const { data: activities = [], isLoading } = useAuditLogsByEntity(caseId);
  const { data: caseData } = useCase(caseId);
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportPDF = async () => {
    if (!caseData || activities.length === 0) return;
    setIsExporting(true);
    try {
      await generateCaseHistoryPDF(caseData, activities);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold dark:text-white">Histórico Recente</h3>
        {activities.length > 0 && (
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileDown size={16} />
            )}
            Exportar Completo
          </button>
        )}
      </div>

      <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {isLoading ? (
          <div className="py-20 text-center bg-white dark:bg-navy-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary-600" size={32} />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Carregando histórico...
            </p>
          </div>
        ) : activities.length > 0 ? (
          activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="relative group">
              <div
                className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center ${
                  activity.action === 'create'
                    ? 'bg-green-500'
                    : activity.action === 'delete'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                }`}
              ></div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold dark:text-white">
                    {new Date(activity.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-white dark:bg-navy-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm group-hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activity.entity_description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-navy-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-slate-400 italic">
              Nenhuma atividade registrada para este processo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
