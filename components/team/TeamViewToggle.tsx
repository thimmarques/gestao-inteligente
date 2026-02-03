
import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface TeamViewToggleProps {
  view: 'cards' | 'table';
  onChange: (view: 'cards' | 'table') => void;
}

export const TeamViewToggle: React.FC<TeamViewToggleProps> = ({ view, onChange }) => {
  const handleToggle = (newView: 'cards' | 'table') => {
    localStorage.setItem('team_view', newView);
    onChange(newView);
  };

  return (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
      <button
        onClick={() => handleToggle('cards')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
          view === 'cards' 
            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        <LayoutGrid size={14} />
        Cards
      </button>
      <button
        onClick={() => handleToggle('table')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
          view === 'table' 
            ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        <List size={14} />
        Tabela
      </button>
    </div>
  );
};
