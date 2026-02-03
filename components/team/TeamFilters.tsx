
import React, { useState, useEffect } from 'react';
// Added CheckCircle2 and Gavel to fix missing icon errors
import { Search, X, ChevronDown, Filter, ArrowUpDown, UserCheck, UserX, Clock, Users, CheckCircle2, Gavel } from 'lucide-react';

interface TeamFiltersProps {
  onFilterChange: (filters: any) => void;
  resultsCount: number;
}

export const TeamFilters: React.FC<TeamFiltersProps> = ({ onFilterChange, resultsCount }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'role' | 'status' | 'sort' | null>(null);
  
  const [filters, setFilters] = useState({
    roles: [] as string[],
    status: 'todos',
    sort: 'name_asc'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchTerm });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filters]);

  const toggleRole = (role: string) => {
    const next = filters.roles.includes(role) 
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    setFilters(prev => ({ ...prev, roles: next }));
  };

  const handleClear = () => {
    setSearchTerm('');
    setFilters({ roles: [], status: 'todos', sort: 'name_asc' });
    onFilterChange({ search: '', roles: [], status: 'todos', sort: 'name_asc' });
  };

  const isFiltered = searchTerm || filters.roles.length > 0 || filters.status !== 'todos';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 py-2">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, OAB ou e-mail..."
          className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white shadow-sm transition-all"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Role Filter */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'role' ? null : 'role')}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              filters.roles.length > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
            }`}
          >
            <Users size={14} />
            Cargo
            {filters.roles.length > 0 && <span className="bg-primary-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{filters.roles.length}</span>}
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'role' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'role' && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-in zoom-in-95">
              {['admin', 'advogado', 'assistente'].map(r => (
                <label key={r} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group">
                   <input 
                    type="checkbox" 
                    checked={filters.roles.includes(r)}
                    onChange={() => toggleRole(r)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" 
                  />
                   <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-primary-600">{r}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
              filters.status !== 'todos' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
            }`}
          >
            {filters.status === 'ativo' ? <UserCheck size={14} /> : filters.status === 'inativo' ? <UserX size={14} /> : <Filter size={14} />}
            Status
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'status' && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-in zoom-in-95">
              {['todos', 'ativo', 'inativo'].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilters({...filters, status: s}); setOpenDropdown(null); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${filters.status === s ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {s}
                  {filters.status === s && <CheckCircle2 size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative">
           <button 
            onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
            className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm"
          >
            <ArrowUpDown size={14} />
            Ordenar
            <ChevronDown size={14} className={`transition-transform ${openDropdown === 'sort' ? 'rotate-180' : ''}`} />
          </button>

          {openDropdown === 'sort' && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-in zoom-in-95">
              {[
                { id: 'name_asc', label: 'Nome (A-Z)', icon: <Users size={12} /> },
                { id: 'name_desc', label: 'Nome (Z-A)', icon: <Users size={12} /> },
                { id: 'cases_desc', label: 'Mais Processos', icon: <Gavel size={12} /> },
                { id: 'access_desc', label: 'Último Acesso', icon: <Clock size={12} /> }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => { setFilters({...filters, sort: opt.id}); setOpenDropdown(null); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold ${filters.sort === opt.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-500'}`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isFiltered && (
          <button onClick={handleClear} className="p-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all shadow-sm flex items-center gap-2">
            <X size={20} />
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Limpar</span>
          </button>
        )}

        <div className="px-4 border-l border-slate-200 dark:border-slate-800 hidden sm:block">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{resultsCount} Membros</span>
        </div>
      </div>

      {openDropdown && <div className="fixed inset-0 z-[40]" onClick={() => setOpenDropdown(null)} />}
    </div>
  );
};
