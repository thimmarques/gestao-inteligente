import React from 'react';
import {
  FileText,
  Tag,
  StickyNote,
  BarChart3,
  User,
  Gavel,
  Calendar,
  Clock,
} from 'lucide-react';
import { CaseWithRelations } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';

interface InfoTabProps {
  caseData: CaseWithRelations;
  onClientClick?: () => void;
}

export const InfoTab: React.FC<InfoTabProps> = ({
  caseData,
  onClientClick,
}) => {
  const diffInDays = (date: string) => {
    const start = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Coluna Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card Dados do Processo */}
        <div className="bg-white dark:bg-navy-800/50 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
            <FileText size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold dark:text-white">
              Dados Principais
            </h3>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Número do Processo
                </p>
                <p className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                  {caseData.process_number}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Tribunal / Vara
                </p>
                <p className="text-sm font-bold dark:text-white leading-tight">
                  {caseData.court}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Tipo de Ação
                </p>
                <span className="inline-flex px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase rounded-lg border border-primary-100 dark:border-primary-800/50">
                  {caseData.type}
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Status Atual
                </p>
                <span className="inline-flex px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase rounded-lg border border-slate-200 dark:border-white/10">
                  {caseData.status}
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Valor da Causa
                </p>
                <p className="text-sm font-black dark:text-white">
                  {formatCurrency(caseData.value)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Data de Início
                </p>
                <p className="text-sm font-bold dark:text-white">
                  {formatDate(caseData.started_at)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Data de Encerramento
                </p>
                <p className="text-sm font-bold dark:text-white">
                  {caseData.ended_at
                    ? formatDate(caseData.ended_at)
                    : 'Em andamento'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Cliente
                </p>
                <button
                  onClick={onClientClick}
                  className="flex items-center gap-2 text-sm font-black text-primary-600 hover:text-primary-700 transition-colors group"
                >
                  <User
                    size={14}
                    className="group-hover:scale-110 transition-transform"
                  />
                  <span className="underline underline-offset-4 decoration-primary-200 dark:decoration-primary-900/50 group-hover:decoration-primary-500">
                    {caseData.client?.name || 'Não informado'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Notas */}
        <div className="bg-white dark:bg-navy-800/50 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
            <StickyNote size={20} className="text-primary-500" />
            <h3 className="text-lg font-bold dark:text-white">
              Notas do Processo
            </h3>
          </div>
          <div className="p-8">
            <div className="min-h-[120px]">
              {caseData.notes ? (
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line italic">
                  {caseData.notes}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Nenhuma nota adicionada.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coluna Lateral */}
      <div className="space-y-6">
        {/* Tempo de Tramitação */}
        <div className="bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-[1.5rem] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 mb-6 shadow-xl shadow-primary-500/10">
            <Clock size={32} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
            Tempo de Tramitação
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black dark:text-white tracking-tighter">
              {diffInDays(caseData.started_at)}
            </span>
            <span className="text-sm font-bold text-slate-500">dias</span>
          </div>
        </div>

        {/* Snapshot */}
        <div className="bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 dark:border-white/10 flex items-center gap-3">
            <BarChart3 size={18} className="text-primary-500" />
            <h3 className="font-bold dark:text-white">Snapshot</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Prazos em aberto
              </span>
              <span className="text-xl font-black dark:text-white leading-none">
                {caseData.deadlines_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Audiências agendadas
              </span>
              <span className="text-xl font-black dark:text-white leading-none">
                {caseData.schedules_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Documentos
              </span>
              <span className="text-xl font-black dark:text-white leading-none">
                0
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
