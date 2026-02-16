import React from 'react';
import {
  Calendar,
  MapPin,
  Video,
  Eye,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSchedulesByCase, useCase } from '../../../hooks/useQueries';
import { CreateEventModal } from '../../schedule/CreateEventModal';
import { EventDetailsModal } from '../../schedule/EventDetailsModal';
import { scheduleService } from '../../../services/scheduleService';
import { useAuth } from '../../../contexts/AuthContext';
import { ScheduleEvent } from '../../../types';

interface SchedulesTabProps {
  caseId: string;
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({ caseId }) => {
  const { user: lawyer } = useAuth();
  const {
    data: schedules = [],
    isLoading,
    refetch,
  } = useSchedulesByCase(caseId);
  const { data: caseData } = useCase(caseId);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    React.useState<ScheduleEvent | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleSaveEvent = async (formData: any) => {
    if (!lawyer) return;

    try {
      const start = new Date(`${formData.date}T${formData.startTime}:00`);
      const end = new Date(`${formData.date}T${formData.endTime}:00`);

      const input = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        lawyer_id: lawyer.id,
        office_id: lawyer.office_id,
        client_id: formData.client_id || caseData?.client_id || null,
        case_id: caseId,
        status: formData.status || 'agendado',
        reminder_sent: false,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        location: formData.location || null,
        virtual_link: formData.isVirtual ? formData.virtual_link : null,
      };

      await scheduleService.createSchedule(input);
      await refetch();
      toast.success('Evento agendado com sucesso!');
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(
        'Erro ao salvar evento. Verifique os dados e tente novamente.'
      );
    }
  };

  const handleEdit = (schedule: ScheduleEvent) => {
    setSelectedSchedule(schedule);
    setIsDetailsOpen(false);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (formData: any) => {
    if (!selectedSchedule) return;

    try {
      const start = new Date(`${formData.date}T${formData.startTime}:00`);
      const end = new Date(`${formData.date}T${formData.endTime}:00`);

      const update = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        client_id: formData.client_id || caseData?.client_id || null,
        status: formData.status || selectedSchedule.status,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        location: formData.location || null,
        virtual_link: formData.isVirtual ? formData.virtual_link : null,
      };

      await scheduleService.updateSchedule(selectedSchedule.id, update);
      await refetch();
      toast.success('Evento atualizado com sucesso!');
      setIsEditOpen(false);
      setSelectedSchedule(null);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erro ao atualizar evento.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await scheduleService.deleteSchedule(id);
      await refetch();
      toast.success('Evento removido com sucesso!');
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: ScheduleEvent['status']
  ) => {
    try {
      await scheduleService.updateSchedule(id, { status });
      await refetch();
      toast.success('Status do evento atualizado!');
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  };

  const upcoming = schedules
    .filter((s) => new Date(s.start_time) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  const history = schedules
    .filter((s) => new Date(s.start_time) < new Date())
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );

  const ScheduleCard: React.FC<{ schedule: any; isHistory?: boolean }> = ({
    schedule,
    isHistory = false,
  }) => {
    const date = new Date(schedule.start_time);
    const day = date.getDate();
    const month = date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .toUpperCase();
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div
        className={`bg-white dark:bg-navy-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:shadow-md ${isHistory ? 'opacity-70' : ''}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-100 dark:border-white/10 sm:pr-6">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 leading-none">
              {day}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {month}
            </span>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  schedule.type === 'audiência'
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                }`}
              >
                {schedule.type}
              </span>
              {isHistory && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                  <CheckCircle2 size={10} /> Concluída
                </span>
              )}
            </div>
            <h4 className="font-bold dark:text-white leading-tight">
              {schedule.title}
            </h4>
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
            <button
              onClick={() => {
                setSelectedSchedule(schedule);
                setIsDetailsOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/15 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
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
        <h3 className="text-2xl font-black dark:text-white tracking-tight">
          Audiências e Compromissos
        </h3>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm shadow-lg shadow-primary-900/20 transition-all active:scale-95 group"
        >
          <Plus
            size={18}
            className="mr-2 group-hover:rotate-90 transition-transform"
          />
          Agendar Audiência
        </button>
      </div>

      <div className="space-y-8">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-4">
          Próximas Atividades
          <div className="flex-1 h-px bg-white/5"></div>
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="py-12 bg-white dark:bg-navy-800/50 rounded-3xl border border-white/5 text-center">
              <Loader2
                size={32}
                className="animate-spin text-primary-600 mx-auto mb-2"
              />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Carregando compromissos...
              </p>
            </div>
          ) : upcoming.length > 0 ? (
            upcoming.map((s) => <ScheduleCard key={s.id} schedule={s} />)
          ) : (
            <div className="py-20 bg-transparent rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 text-sm mb-4">
                Nenhuma audiência futura agendada.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="text-primary-500 text-[10px] font-black uppercase tracking-widest hover:text-primary-400 transition-colors"
              >
                AGENDAR AGORA
              </button>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-8 pt-6">
          <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-4">
            Histórico de Atividades
            <div className="flex-1 h-px bg-white/5"></div>
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {history.map((s) => (
              <ScheduleCard key={s.id} schedule={s} isHistory />
            ))}
          </div>
        </div>
      )}

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveEvent}
        mode="create"
        initialData={{
          case_id: caseId,
          client_id: caseData?.client_id,
        }}
      />

      <EventDetailsModal
        isOpen={isDetailsOpen}
        event={selectedSchedule}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusUpdate={handleStatusUpdate}
      />

      <CreateEventModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedSchedule(null);
        }}
        onSave={handleSaveEdit}
        mode="edit"
        initialData={selectedSchedule}
      />
    </div>
  );
};
