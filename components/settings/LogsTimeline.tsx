import React from "react";
import { AuditLog } from "../../types/audit";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Eye,
  User,
  Plus,
  Edit,
  Trash2,
  Shield,
  LogIn,
  LogOut,
  ShieldAlert,
  Download,
  Database,
} from "lucide-react";

interface LogsTimelineProps {
  logs: AuditLog[];
  onExpand: (id: string) => void;
}

export const LogsTimeline: React.FC<LogsTimelineProps> = ({
  logs,
  onExpand,
}) => {
  const groupedLogs = logs.reduce((groups: any, log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  const getActionStyle = (action: string) => {
    const styles: any = {
      create: { icon: Plus, color: "bg-green-500" },
      update: { icon: Edit, color: "bg-blue-500" },
      delete: { icon: Trash2, color: "bg-red-500" },
      permission_change: { icon: Shield, color: "bg-purple-500" },
      access_denied: { icon: ShieldAlert, color: "bg-orange-500" },
      login: { icon: LogIn, color: "bg-emerald-500" },
      logout: { icon: LogOut, color: "bg-slate-400" },
      export: { icon: Download, color: "text-orange-500" },
    };
    return styles[action] || { icon: Database, color: "bg-slate-500" };
  };

  return (
    <div className="space-y-12 py-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
      {Object.entries(groupedLogs).map(([date, dayLogs]: any) => {
        const dateObj = new Date(date);
        let dateLabel = format(dateObj, "dd 'de' MMMM", { locale: ptBR });
        if (isToday(dateObj)) dateLabel = "Hoje";
        else if (isYesterday(dateObj)) dateLabel = "Ontem";

        return (
          <div key={date} className="space-y-8">
            <h3 className="sticky top-0 z-10 py-1 px-4 bg-slate-50 dark:bg-slate-900/80 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 w-fit ml-4 shadow-sm border border-slate-200 dark:border-slate-800">
              {dateLabel}
            </h3>

            <div className="space-y-6">
              {dayLogs.map((log: AuditLog) => {
                const { icon: Icon, color } = getActionStyle(log.action);
                return (
                  <div
                    key={log.id}
                    className="relative pl-12 group animate-in slide-in-from-left-4 duration-300"
                  >
                    <div
                      className={`absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full z-10 border-2 border-white dark:border-slate-950 ${color}`}
                    />

                    <div
                      onClick={() => onExpand(log.id)}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group/card"
                    >
                      <header className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {log.lawyer_name[0]}
                          </div>
                          <span className="text-xs font-bold dark:text-white uppercase tracking-tighter">
                            {log.lawyer_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">
                          {format(new Date(log.timestamp), "HH:mm:ss")} •{" "}
                          {formatDistanceToNow(new Date(log.timestamp), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </header>

                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${color} text-white`}>
                          <Icon size={12} strokeWidth={3} />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-bold uppercase text-[10px] mr-1">
                            {log.action.replace("_", " ")}
                          </span>
                          {log.entity_description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-[8px] font-bold text-slate-400 uppercase border border-slate-100 dark:border-slate-700">
                            {log.entity_type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${
                              log.criticality === "crítico"
                                ? "text-red-500 bg-red-50"
                                : "text-slate-500 bg-slate-50"
                            }`}
                          >
                            {log.criticality}
                          </span>
                        </div>
                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
