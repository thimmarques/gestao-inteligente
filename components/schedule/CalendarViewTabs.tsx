
import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  CalendarClock, 
  List,
  ChevronDown
} from 'lucide-react';

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

interface CalendarViewTabsProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

export const CalendarViewTabs: React.FC<CalendarViewTabsProps> = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'month', label: 'Mês', icon: <Calendar size={16} /> },
    { id: 'week', label: 'Semana', icon: <CalendarDays size={16} /> },
    { id: 'day', label: 'Dia', icon: <CalendarClock size={16} /> },
    { id: 'agenda', label: 'Lista', icon: <List size={16} /> },
  ];

  return (
    <div className="w-full md:w-auto">
      {/* Mobile Select View */}
      <div className="relative md:hidden w-full">
        <select
          value={currentView}
          onChange={(e) => onViewChange(e.target.value as CalendarViewType)}
          className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
        >
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown size={18} />
        </div>
      </div>

      {/* Desktop Tabs View */}
      <div 
        className="hidden md:flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        role="tablist"
      >
        {views.map((view) => {
          const isActive = currentView === view.id;
          return (
            <button
              key={view.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onViewChange(view.id as CalendarViewType)}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.12em] transition-all duration-200
                ${isActive 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              {view.icon}
              {view.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
