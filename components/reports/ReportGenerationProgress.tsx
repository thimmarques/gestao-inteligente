import React from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface ReportGenerationProgressProps {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
}

export const ReportGenerationProgress: React.FC<
  ReportGenerationProgressProps
> = ({ isGenerating, progress, currentStep }) => {
  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-300">
        <div className="relative">
          <div className="w-24 h-24 bg-primary-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary-500/40 animate-pulse">
            <FileText size={48} />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
            <Loader2 size={24} className="animate-spin text-primary-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-black dark:text-white tracking-tight">
            Gerando Relatório...
          </h3>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            {currentStep}
          </p>
        </div>

        <div className="w-full space-y-4">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-3xl font-black text-primary-600 tabular-nums tracking-tighter">
            {progress}%
          </p>
        </div>

        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
          Não feche esta janela. Estamos compilando dados, capturando gráficos e
          formatando seu documento profissional.
        </p>
      </div>
    </div>
  );
};
