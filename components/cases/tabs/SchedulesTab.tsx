
import React from 'react';
import { Calendar, MapPin, Video, Eye, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useSchedulesByCase } from '../../../hooks/useQueries';

interface SchedulesTabProps {
  caseId: string;
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({ caseId }) => {
  const { data: schedules = [], isLoading } = useSchedulesByCase(caseId);

  const upcoming = schedules.filter(s => new Date(s.start_time) >= new Date()).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const history = schedules.filter(s => new Date(s.start_time) < new Date()).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const ScheduleCard: React.FC<{ schedule: any, isHistory?: boolean }> = ({ schedule, isHistory = false }) => {
    const date = new Date(schedule.start_time);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md ${isHistory ? 'opacity-70' : ''}`}>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 sm:pr-6">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 leading-none">{day}</span>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{month}</span>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${schedule.type === 'audiência' ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                }`}>
                {schedule.type}
              </span>
              {isHistory && <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest"><CheckCircle2 size={10} /> Concluída</span>}
            </div>
            <h4 className="font-bold dark:text-white leading-tight">{schedule.title}</h4>
            <div className="flex flex-col gap-1">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Clock size={12} />
                {time}
              </p>
              {schedule.virtual ? (
                <p className="text-xs text-primary-600 flex items-center gap-2 font-medium">
                  <Video size={12} />
                  Link Virtual
                </p>
              ) : (
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <MapPin size={12} />
                  {schedule.location}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Eye size={14} />
              Ver
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold dark:text-white">Audiências e Compromissos</h3>
      </div>

      <div className="space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          Próximas Audiências
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </h4>
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center">
              <Loader2 size={32} className="animate-spin text-primary-600 mx-auto mb-2" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Carregando compromissos...</p>
            </div>
          ) : upcoming.length > 0 ? (
            upcoming.map(s => <ScheduleCard key={s.id} schedule={s} />)
          ) : (
            <div className="py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500">
              <p className="text-sm">Nenhuma audiência futura agendada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
