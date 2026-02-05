import React from "react";
import {
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Video,
  ChevronRight,
} from "lucide-react";
import { ScheduleEvent } from "../../types";
import { getEventColor, getEventIcon } from "../../utils/eventColors";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpcomingEventsBalloonProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

export const UpcomingEventsBalloon: React.FC<UpcomingEventsBalloonProps> = ({
  events,
  onEventClick,
}) => {
  const upcoming = events
    .filter(
      (e) =>
        e.status === "agendado" &&
        new Date(e.start_time) >= startOfDay(new Date()),
    )
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
              Snapshot Diário
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Próximos 5 compromissos
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {upcoming.map((event) => {
          const startDate = new Date(event.start_time);
          const eventColor = getEventColor(event.type);
          const Icon = getEventIcon(event.type);

          let dateLabel = format(startDate, "dd 'de' MMM", { locale: ptBR });
          if (isToday(startDate)) dateLabel = "Hoje";
          else if (isTomorrow(startDate)) dateLabel = "Amanhã";

          return (
            <button
              key={event.id}
              onClick={() => onEventClick(event)}
              className="w-full flex items-center gap-4 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group text-left"
            >
              <div
                className="w-12 h-12 rounded-2xl shrink-0 flex flex-col items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: eventColor }}
              >
                <Icon size={18} />
                <span className="text-[8px] font-black uppercase mt-0.5">
                  {format(startDate, "HH:mm")}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[9px] font-black uppercase text-primary-600 tracking-tighter bg-primary-50 dark:bg-primary-900/20 px-1.5 py-0.5 rounded">
                    {dateLabel}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase truncate">
                    {event.type}
                  </span>
                </div>
                <h4 className="text-sm font-bold dark:text-white truncate group-hover:text-primary-600 transition-colors">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {event.virtual_link ? (
                    <Video size={10} className="text-primary-500" />
                  ) : (
                    <MapPin size={10} className="text-slate-400" />
                  )}
                  <span className="text-[10px] text-slate-500 truncate">
                    {event.virtual_link
                      ? "Link Virtual"
                      : event.location || "Local não definido"}
                  </span>
                </div>
              </div>

              <ChevronRight
                size={16}
                className="text-slate-300 group-hover:text-primary-500 transition-all"
              />
            </button>
          );
        })}
      </div>

      <div className="pt-2">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
            Sua agenda está sincronizada com o Google Calendar.
          </p>
        </div>
      </div>
    </div>
  );
};
