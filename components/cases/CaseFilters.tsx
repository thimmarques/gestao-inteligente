
import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface Filters {
  types: string[];
  status: string[];
}

interface CaseFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

const types = ['Cível', 'Trabalhista', 'Criminal', 'Família', 'Tributário', 'Previdenciário', 'Administrativo'];
const statusList = ['Distribuído', 'Andamento', 'Sentenciado', 'Recurso', 'Arquivado', 'Encerrado'];

export const CaseFilters: React.FC<CaseFiltersProps> = ({ onFilterChange }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<'type' | 'status' | null>(null);

  const toggleType = (type: string) => {
    const next = selectedTypes.includes(type) 
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(next);
    onFilterChange({ types: next, status: selectedStatus });
  };

  const toggleStatus = (status: string) => {
    const next = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    setSelectedStatus(next);
    onFilterChange({ types: selectedTypes, status: next });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatus([]);
    onFilterChange({ types: [], status: [] });
  };

  const isActive = selectedTypes.length > 0 || selectedStatus.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      <div className="relative">
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            selectedTypes.length > 0 
              ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <span>Tipo</span>
          {selectedTypes.length > 0 && (
            <span className="bg-primary-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {selectedTypes.length}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'type' && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
            {types.map(t => (
              <label key={t} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedTypes.includes(t)}
                  onChange={() => toggleType(t)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                />
                <span className="text-sm dark:text-slate-300">{t}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
            selectedStatus.length > 0 
              ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          <span>Status</span>
          {selectedStatus.length > 0 && (
            <span className="bg-primary-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {selectedStatus.length}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === 'status' && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-20 p-2 animate-in fade-in zoom-in-95 duration-200">
            {statusList.map(s => (
              <label key={s} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedStatus.includes(s)}
                  onChange={() => toggleStatus(s)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                />
                <span className="text-sm dark:text-slate-300">{s}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {isActive && (
        <button 
          onClick={clearFilters}
          className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 text-sm font-bold transition-colors"
        >
          <X size={16} />
          Limpar Filtros
        </button>
      )}

      {/* Close dropdowns when clicking outside */}
      {(openDropdown) && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
      )}
    </div>
  );
};
