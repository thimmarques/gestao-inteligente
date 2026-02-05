import React from "react";
import {
  Clock,
  MapPin,
  Video,
  Eye,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { ScheduleEvent } from "../../types";
import { getEventColor, getEventIcon } from "../../utils/eventColors";

interface AgendaListViewProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

export const AgendaListView: React.FC<AgendaListViewProps> = ({
  events,
  onEventClick,
}) => {
  // Agrupar eventos por dia
  const groupedEvents = events
    .filter((e) => e.status !== "cancelado")
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
    .reduce((groups: Record<string, ScheduleEvent[]>, event) => {
      const dateKey = new Date(event.start_time).toISOString().split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
      return groups;
    }, {});

  const dates = Object.keys(groupedEvents).sort();

  if (dates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
          <CalendarIcon size={40} />
        </div>
        <h3 className="text-xl font-bold dark:text-white">
          Nenhum evento agendado
        </h3>
        <p className="text-slate-500 mt-2">
          Você não possui compromissos nos próximos dias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      {dates.map((dateKey) => {
        const eventsForDay = groupedEvents[dateKey];
        const dateObj = new Date(dateKey + "T12:00:00");
        const isToday = dateKey === new Date().toISOString().split("T")[0];

        return (
          <div key={dateKey} className="space-y-4">
            <header className="flex items-center gap-4 px-2">
              <div className="flex flex-col">
                <h3
                  className={`text-lg font-black dark:text-white ${isToday ? "text-primary-600" : ""}`}
                >
                  {dateObj.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </h3>
                {isToday && (
                  <span className="text-[10px] font-black uppercase text-primary-500 tracking-[0.2em]">
                    Hoje
                  </span>
                )}
              </div>
              <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                {eventsForDay.length} EVENTOS
              </div>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
            </header>

            <div className="grid grid-cols-1 gap-3">
              {eventsForDay.map((event) => {
                const Icon = getEventIcon(event.type);
                const color = getEventColor(event.type, event.status);
                const startTime = new Date(event.start_time).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" },
                );
                const endTime = new Date(event.end_time).toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" },
                );

                return (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-stretch bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all active:scale-[0.99] text-left group"
                  >
                    <div
                      className="w-2"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="p-6 flex flex-1 items-center gap-6">
                      <div className="w-16 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 pr-6 shrink-0">
                        <span className="text-xl font-black dark:text-white tabular-nums">
                          {startTime}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                          {endTime}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                            }}
                          >
                            {event.type}
                          </span>
                          {event.status === "concluído" && (
                            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-green-100 text-green-700 rounded-md">
                              Concluído
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold dark:text-white truncate">
                          {event.title}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {event.virtual_link ? (
                            <span className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
                              <Video size={14} /> Link Virtual
                            </span>
                          ) : event.location ? (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                              <MapPin size={14} /> {event.location}
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium truncate">
                            <CalendarIcon size={14} /> Proc.{" "}
                            {event.case_id || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-slate-300 group-hover:text-primary-500 transition-colors">
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
