import React from "react";
import { FileText, History } from "lucide-react";

export const ReportsEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-300 dark:text-slate-700">
          <FileText size={56} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-lg text-slate-400">
          <History size={20} />
        </div>
      </div>

      <h3 className="text-xl font-black dark:text-white tracking-tight mb-2">
        Nenhum relatório gerado ainda
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        Sua central de inteligência está vazia. Escolha um dos modelos acima
        para compilar seus dados jurídicos e financeiros.
      </p>

      <div className="mt-8 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
