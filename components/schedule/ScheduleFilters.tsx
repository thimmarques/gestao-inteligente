import React from 'react';
import {
  Filter,
  X,
  Check,
  Users,
  Clock,
  Gavel,
  Calendar as CalendarIcon,
  ShieldCheck,
} from 'lucide-react';
import { ScheduleFilters } from '../../utils/scheduleFilters';

interface ScheduleFiltersBarProps {
  filters: ScheduleFilters;
  onFilterChange: (filters: Partial<ScheduleFilters>) => void;
  isOpen: boolean;
}

export const ScheduleFiltersBar: React.FC<ScheduleFiltersBarProps> = ({
  filters,
  onFilterChange,
  isOpen,
}) => {
  if (!isOpen || !filters) return null;

  const eventTypes = [
    { id: 'audiência', label: 'Audiências', icon: Gavel },
    { id: 'reunião', label: 'Reuniões', icon: Users },
    { id: 'prazo', label: 'Prazos', icon: Clock },
    { id: 'compromisso', label: 'Compromissos', icon: CalendarIcon },
  ];

  const statusOptions = [
    { id: 'agendado', label: 'Agendados' },
    { id: 'concluído', label: 'Concluídos' },
    { id: 'cancelado', label: 'Cancelados' },
  ];

  const toggleType = (type: string) => {
    const currentTypes = filters.types || [];
    const next = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onFilterChange({ types: next });
  };

  const toggleStatus = (status: string) => {
    const currentStatus = filters.status || [];
    const next = currentStatus.includes(status)
      ? currentStatus.filter((s) => s !== status)
      : [...currentStatus, status];
    onFilterChange({ status: next });
  };

  const hasFilters =
    (filters.types?.length || 0) > 0 ||
    (filters.status?.length || 0) > 0 ||
    filters.showOnlyMine;

  return (
    <div className="bg-white dark:bg-navy-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm animate-in slide-in-from-top-4 duration-300 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Filter size={14} /> Filtros de Visualização
        </h3>
        {hasFilters && (
          <button
            onClick={() =>
              onFilterChange({ types: [], status: [], showOnlyMine: false })
            }
            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            <X size={12} /> Limpar Tudo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tipos de Evento */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Tipos de Evento
          </p>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((t) => {
              const isActive = (filters.types || []).includes(t.id);
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => toggleType(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                    isActive
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-slate-50 dark:bg-navy-800 border-slate-100 dark:border-white/15 text-slate-500 hover:border-primary-500'
                  }`}
                >
                  <Icon size={12} />
                  {t.label}
                  {isActive && <Check size={10} strokeWidth={4} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Situação
          </p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => {
              const isActive = (filters.status || []).includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStatus(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                    isActive
                      ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                      : 'bg-slate-50 dark:bg-navy-800 border-slate-100 dark:border-white/15 text-slate-500 hover:border-primary-500'
                  }`}
                >
                  {s.label}
                  {isActive && <Check size={10} strokeWidth={4} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros Pessoais */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Preferências
          </p>
          <button
            onClick={() =>
              onFilterChange({ showOnlyMine: !filters.showOnlyMine })
            }
            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${
              filters.showOnlyMine
                ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 text-indigo-700 dark:text-indigo-400'
                : 'bg-slate-50 dark:bg-navy-800 border-slate-100 dark:border-white/15 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${filters.showOnlyMine ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
              >
                <ShieldCheck size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">
                Ver apenas meus eventos
              </span>
            </div>
            <div
              className={`w-10 h-5 rounded-full relative transition-all ${filters.showOnlyMine ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div
                className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all ${filters.showOnlyMine ? 'translate-x-5' : ''}`}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
