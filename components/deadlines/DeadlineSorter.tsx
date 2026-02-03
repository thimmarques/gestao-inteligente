
import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { DeadlineSort } from '../../types';

interface DeadlineSorterProps {
  currentSort: DeadlineSort;
  onChange: (sort: DeadlineSort) => void;
}

export const DeadlineSorter: React.FC<DeadlineSorterProps> = ({ currentSort, onChange }) => {
  const options = [
    { label: 'Data Limite (Crescente)', field: 'deadline_date', dir: 'asc' },
    { label: 'Data Limite (Decrescente)', field: 'deadline_date', dir: 'desc' },
    { label: 'Prioridade (Urgente primeiro)', field: 'priority', dir: 'asc' },
    { label: 'Prioridade (Baixa primeiro)', field: 'priority', dir: 'desc' },
    { label: 'Status (Vencidos primeiro)', field: 'status', dir: 'asc' },
    { label: 'Processo (A-Z)', field: 'process', dir: 'asc' },
    { label: 'Cliente (A-Z)', field: 'client', dir: 'asc' },
  ];

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [field, direction] = e.target.value.split('|');
    onChange({ field: field as any, direction: direction as any });
  };

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors">
        <ArrowUpDown size={14} />
      </div>
      <select
        value={`${currentSort.field}|${currentSort.direction}`}
        onChange={handleSelect}
        className="pl-11 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-500 appearance-none shadow-sm outline-none"
      >
        {options.map((opt, i) => (
          <option key={i} value={`${opt.field}|${opt.dir}`}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown size={14} />
      </div>
    </div>
  );
};
