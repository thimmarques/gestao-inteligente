
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  LayoutGrid,
  Settings,
  X
} from 'lucide-react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { CalendarViewTabs, CalendarViewType } from '../../components/schedule/CalendarViewTabs.tsx';
import { CreateEventModal } from '../../components/schedule/CreateEventModal.tsx';
import { EventDetailsModal } from '../../components/schedule/EventDetailsModal.tsx';
import { ImportGoogleModal } from '../../components/schedule/ImportGoogleModal.tsx';
import { AgendaListView } from '../../components/schedule/AgendaListView.tsx';
import { GoogleSyncBadge } from '../../components/schedule/GoogleSyncBadge.tsx';
import { ScheduleFiltersBar } from '../../components/schedule/ScheduleFilters.tsx';
import { UpcomingEventsBalloon } from '../../components/schedule/UpcomingEventsBalloon.tsx';

import { scheduleService } from '../services/scheduleService.ts';
import { seedSchedules } from '../utils/seedSchedules.ts';
import { filterSchedules, ScheduleFilters } from '../utils/scheduleFilters.ts';
import { getEventColor } from '../utils/eventColors.ts';
import { ScheduleEvent } from '../types.ts';
import { useApp } from '../contexts/AppContext.tsx';

const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const Schedule: React.FC = () => {
  const { lawyer } = useApp();
  const [view, setView] = useState<CalendarViewType>('month');
  const [date, setDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [defaultSlot, setDefaultSlot] = useState<{ start: Date; end: Date } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ScheduleFilters>({
    types: [],
    status: ['agendado'],
    clients: [],
    lawyers: [],
    showOnlyMine: false
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    seedSchedules();
    const data = await scheduleService.getSchedules();
    setSchedules(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const calendarEvents = useMemo(() => {
    const currentLawyerId = lawyer?.id || 'lawyer-1';
    const filtered = filterSchedules(schedules, filters, currentLawyerId);
    const searched = filtered.filter(s =>
      !searchTerm ||
      (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return searched.map(s => ({
      ...s,
      start: new Date(s.start_time),
      end: new Date(s.end_time)
    }));
  }, [schedules, filters, searchTerm, lawyer]);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEvent(null);
    setDefaultSlot({ start, end });
    setIsCreateOpen(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(false);
    setIsCreateOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    setIsDetailsOpen(false);
    setSelectedEvent(null);
    await scheduleService.deleteSchedule(id);
    loadData();
  };

  const handleStatusUpdate = async (id: string, status: ScheduleEvent['status']) => {
    setIsDetailsOpen(false);
    setSelectedEvent(null);
    await scheduleService.updateSchedule(id, { status });
    loadData();
  };

  const handleSaveEvent = async (formData: any) => {
    const input = {
      ...formData,
      lawyer_id: lawyer?.id || 'lawyer-1',
      office_id: lawyer?.office_id || 'office-1',
      status: formData.status || 'agendado',
      reminder_sent: false,
      start_time: formData.start_time || new Date(`${formData.date}T${formData.startTime}:00`).toISOString(),
      end_time: formData.end_time || new Date(`${formData.date}T${formData.endTime}:00`).toISOString(),
    };

    if (selectedEvent) {
      await scheduleService.updateSchedule(selectedEvent.id, input);
    } else {
      await scheduleService.createSchedule(input);
    }
    loadData();
    setIsCreateOpen(false);
    setSelectedEvent(null);
  };

  const handleFilterChange = (newFilters: Partial<ScheduleFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-3xl font-black dark:text-white tracking-tight flex items-center gap-3">
          Agenda {isLoading && <Loader2 className="animate-spin text-primary-50" size={24} />}
        </h1>
        <div className="flex gap-3">
          <button onClick={() => setIsImportOpen(true)} className="flex items-center px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all hover:bg-slate-50 active:scale-95"><Globe size={20} className="mr-2 text-blue-500" /> Google Sync</button>
          <button onClick={() => { setSelectedEvent(null); setIsCreateOpen(true); }} className="flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 group"><Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform" /> Novo Evento</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <UpcomingEventsBalloon
            events={schedules}
            onEventClick={handleSelectEvent}
          />
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 min-h-[600px] relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <CalendarViewTabs currentView={view} onViewChange={(v) => setView(v)} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={`p-3 rounded-xl border transition-all ${isFiltersOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                title="Filtros"
              >
                <Filter size={20} />
              </button>
              <button onClick={loadData} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-primary-600 transition-all" title="Recarregar">
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <ScheduleFiltersBar filters={filters} onFilterChange={handleFilterChange} isOpen={isFiltersOpen} />

          <div className="mt-6">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              view={view as View}
              date={date}
              onNavigate={setDate}
              onView={(v) => setView(v as CalendarViewType)}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              culture="pt-BR"
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Lista",
              }}
              style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}
              eventPropGetter={(event: any) => ({
                style: { backgroundColor: getEventColor(event.type, event.status), borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', border: 'none', padding: '2px 8px' }
              })}
            />
          </div>
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setSelectedEvent(null); }}
        onSave={handleSaveEvent}
        initialData={selectedEvent}
        mode={selectedEvent ? 'edit' : 'create'}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onStatusUpdate={handleStatusUpdate}
      />
      <ImportGoogleModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} onImportComplete={loadData} />
    </div>
  );
};

export default Schedule;
