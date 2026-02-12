import React from 'react';
import { Shield, FileText, MapPin, Calendar, Users, Info } from 'lucide-react';

interface DefensoriaFieldsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const DefensoriaFields: React.FC<DefensoriaFieldsProps> = ({
  data,
  onChange,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-white/10 space-y-6">
        <h4 className="font-bold dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-green-500" />
          Dados Processuais
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Nº Processo Nomeação
            </label>
            <input
              type="text"
              value={data.process_number || ''}
              onChange={(e) => onChange('process_number', e.target.value)}
              placeholder="0000000-00.0000.0.00.0000"
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Comarca / Foro
            </label>
            <input
              type="text"
              value={data.comarca || ''}
              onChange={(e) => onChange('comarca', e.target.value)}
              placeholder="Ex: São Paulo - Central"
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Data de Nomeação
            </label>
            <input
              type="date"
              value={data.appointment_date || ''}
              onChange={(e) => onChange('appointment_date', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Tipo de Processo
            </label>
            <select
              value={data.process_type || 'cível'}
              onChange={(e) => onChange('process_type', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            >
              <option value="cível">Cível</option>
              <option value="trabalhista">Trabalhista</option>
              <option value="criminal">Criminal</option>
              <option value="família">Família</option>
              <option value="tributário">Tributário</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-white/10 space-y-6">
        <h4 className="font-bold dark:text-white flex items-center gap-2">
          <Users size={18} className="text-green-500" />
          Situação Socioeconômica
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-navy-800/50 rounded-xl">
            <span className="text-sm font-medium dark:text-slate-300">
              Declaração Hipossuficiência
            </span>
            <button
              type="button"
              onClick={() =>
                onChange('has_hipossuficiencia', !data.has_hipossuficiencia)
              }
              className={`w-12 h-6 rounded-full transition-colors relative ${data.has_hipossuficiencia ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${data.has_hipossuficiencia ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Situação Habitacional
            </label>
            <input
              type="text"
              value={data.housing_status || ''}
              onChange={(e) => onChange('housing_status', e.target.value)}
              placeholder="Ex: Aluguel, Casa Própria"
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            />
          </div>
          <div className="col-span-full space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Observações Sociais
            </label>
            <textarea
              value={data.social_notes || ''}
              onChange={(e) =>
                onChange('social_notes', e.target.value.slice(0, 500))
              }
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-navy-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none"
              placeholder="Descreva a situação do cliente..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
