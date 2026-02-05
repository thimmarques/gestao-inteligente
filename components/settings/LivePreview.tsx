import React from "react";
import { useApp } from "../../contexts/AppContext.tsx";
import { Search, Bell, Moon, User, ChevronDown } from "lucide-react";

export const LivePreview: React.FC = () => {
  const { lawyer, office } = useApp();

  return (
    <div className="hidden xl:block sticky top-8 space-y-6 animate-in slide-in-from-right-4 duration-700">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">
          Preview no Sistema
        </h3>

        <div className="space-y-10 scale-[0.9] origin-top">
          {/* Header Mockup */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Cabeçalho
            </p>
            <div className="h-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between px-6 shadow-sm overflow-hidden">
              <div className="w-24 h-6 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center px-3 gap-2">
                <Search size={10} className="text-slate-400" />
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Moon size={14} className="text-slate-400" />
                <Bell size={14} className="text-slate-400" />
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-2 p-1 pl-1 pr-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-primary-600 overflow-hidden shadow-inner flex items-center justify-center">
                    {lawyer?.photo_url ? (
                      <img
                        src={lawyer.photo_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] text-white font-bold">
                        JS
                      </span>
                    )}
                  </div>
                  <ChevronDown size={10} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Mockup */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              Menu Lateral
            </p>
            <div className="w-48 h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] mx-auto p-4 flex flex-col shadow-sm">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {office.logo_url ? (
                  <img
                    src={office.logo_url}
                    className="h-6 w-auto object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary-600 rounded-md" />
                    <span className="text-xs font-black dark:text-white">
                      LegalTech
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 pt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-lg ${i === 1 ? "bg-primary-600 shadow-lg shadow-primary-500/20" : "bg-slate-100 dark:bg-slate-900"}`}
                  />
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    {lawyer?.photo_url ? (
                      <img
                        src={lawyer.photo_url}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={12} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="w-2/3 h-1 bg-slate-100 dark:bg-slate-900 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
            Todas as alterações aplicadas aqui serão visíveis para toda a equipe
            do seu escritório instantaneamente.
          </p>
        </div>
      </div>
    </div>
  );
};
