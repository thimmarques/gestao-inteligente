import React from "react";
import { FileText, FileSpreadsheet, ChevronRight } from "lucide-react";

interface ReportTypeCardProps {
  type: "financeiro" | "produtividade" | "clientes" | "prazos";
  title: string;
  description: string;
  icon: React.ReactNode;
  defaultFormat: "pdf" | "excel";
  iconBgColor: string;
  iconColor: string;
  onGenerate: () => void;
}

export const ReportTypeCard: React.FC<ReportTypeCardProps> = ({
  title,
  description,
  icon,
  defaultFormat,
  iconBgColor,
  iconColor,
  onGenerate,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
      <div className="flex flex-col items-center text-center flex-1">
        <div
          className={`w-24 h-24 rounded-[2rem] ${iconBgColor} flex items-center justify-center ${iconColor} mb-8 shadow-inner group-hover:scale-110 transition-transform`}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { size: 48 })}
        </div>

        <h3 className="text-xl font-black dark:text-white tracking-tight mb-3">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4 mb-6">
          {description}
        </p>

        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">
          {defaultFormat === "pdf" ? (
            <FileText size={12} />
          ) : (
            <FileSpreadsheet size={12} />
          )}
          Padrão: {defaultFormat}
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={onGenerate}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          Configurar Relatório
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
