
import React, { useState } from 'react';
import { 
  startOfMonth, endOfMonth, subMonths, 
  startOfYear, endOfYear, subYears 
} from 'date-fns';

interface PeriodPresetsProps {
  onSelect: (start: Date, end: Date) => void;
  activeLabel?: string;
}

export const PeriodPresets: React.FC<PeriodPresetsProps> = ({ onSelect, activeLabel }) => {
  const [selected, setSelected] = useState(activeLabel || '');

  const presets = [
    {
      label: 'Este Mês',
      getValue: () => {
        const now = new Date();
        return { start: startOfMonth(now), end: endOfMonth(now) };
      }
    },
    {
      label: 'Último Mês',
      getValue: () => {
        const last = subMonths(new Date(), 1);
        return { start: startOfMonth(last), end: endOfMonth(last) };
      }
    },
    {
      label: 'Últimos 3 Meses',
      getValue: () => {
        const now = new Date();
        return { start: subMonths(now, 3), end: now };
      }
    },
    {
      label: 'Últimos 6 Meses',
      getValue: () => {
        const now = new Date();
        return { start: subMonths(now, 6), end: now };
      }
    },
    {
      label: 'Este Ano',
      getValue: () => {
        const now = new Date();
        return { start: startOfYear(now), end: now };
      }
    },
    {
      label: 'Ano Passado',
      getValue: () => {
        const last = subYears(new Date(), 1);
        return { start: startOfYear(last), end: endOfYear(last) };
      }
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() => {
            const { start, end } = p.getValue();
            onSelect(start, end);
            setSelected(p.label);
          }}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border ${
            selected === p.label 
              ? 'bg-primary-600 border-primary-600 text-white' 
              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-primary-500'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};
