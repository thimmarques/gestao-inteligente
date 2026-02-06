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
}

export const InfoTab: React.FC<InfoTabProps> = ({ caseData }) => {
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            <h3 className="font-bold dark:text-white">Dados Principais</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Número do Processo
                </p>
                <p className="font-mono text-sm font-bold text-primary-600 dark:text-primary-400">
                  {caseData.process_number}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Tribunal / Vara
                </p>
                <p
                  className="text-sm font-medium dark:text-white truncate"
                  title={caseData.court}
                >
                  {caseData.court}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Tipo de Ação
                </p>
                <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-100 dark:border-blue-800">
                  {caseData.type}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Status Atual
                </p>
                <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase rounded border border-slate-200 dark:border-slate-700">
                  {caseData.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Valor da Causa
                </p>
                <p className="text-sm font-bold dark:text-white">
                  {formatCurrency(caseData.value)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Data de Início
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {formatDate(caseData.started_at)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Data de Encerramento
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {caseData.ended_at
                    ? formatDate(caseData.ended_at)
                    : 'Em andamento'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Cliente
                </p>
                <button className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:underline">
                  <User size={14} />
                  {caseData.client?.name || 'ID ' + caseData.client_id}
                </button>
              </div>
              <div className="col-span-full space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Advogado Responsável
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-[10px] font-bold text-primary-600">
                    {caseData.lawyer?.name?.[0] || 'A'}
                  </div>
                  <p className="text-sm font-medium dark:text-white">
                    {caseData.lawyer?.name || 'Não atribuído'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Tags */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-primary-500" />
              <h3 className="font-bold dark:text-white">Tags</h3>
            </div>
            <button className="text-xs font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors">
              Editar
            </button>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {caseData.tags && caseData.tags.length > 0 ? (
                caseData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-100 dark:border-slate-700"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  Nenhuma tag vinculada ao processo.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Card Notas */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote size={18} className="text-primary-500" />
              <h3 className="font-bold dark:text-white">Notas do Processo</h3>
            </div>
            <button className="text-xs font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors">
              Editar
            </button>
          </div>
          <div className="p-6">
            <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {caseData.notes ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-500" />
            <h3 className="font-bold dark:text-white">Estatísticas</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Prazos Pendentes
                </span>
              </div>
              <span className="text-lg font-bold dark:text-white">
                {caseData.deadlines_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                  <Calendar size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Audiências Futuras
                </span>
              </div>
              <span className="text-lg font-bold dark:text-white">
                {caseData.schedules_count || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Saldo Financeiro
                </span>
              </div>
              <span
                className={`text-lg font-bold ${caseData.finances_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {formatCurrency(caseData.finances_balance || 0)}
              </span>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                  <BarChart3 size={16} />
                </div>
                <span className="text-sm font-medium text-slate-500">
                  Dias de Processo
                </span>
              </div>
              <span className="text-lg font-bold dark:text-white">
                {diffInDays(caseData.started_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
