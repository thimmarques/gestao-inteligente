
import React, { useState, useMemo } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, Calendar,
  Search, Filter, Loader2, Plus, ArrowUpRight, ArrowDownRight,
  Wallet, Landmark, Receipt, FileText, ChevronRight, Clock
} from 'lucide-react';
import { useFinances } from '../hooks/useQueries';
import { financeService } from '../services/financeService';
import { FinanceRecord } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CreateFinanceModal } from '../components/finance/CreateFinanceModal';

const Finance: React.FC = () => {
  const { data: records = [], isLoading, refetch } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = useMemo(() => {
    const income = records.filter(r => r.type === 'receita').reduce((acc, r) => acc + r.amount, 0);
    const expense = records.filter(r => r.type === 'despesa').reduce((acc, r) => acc + r.amount, 0);
    const balance = income - expense;
    const pending = records.filter(r => r.status === 'pendente').reduce((acc, r) => acc + r.amount, 0);

    return { income, expense, balance, pending };
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'todos' || r.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, searchTerm, typeFilter]);

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Financeiro</h1>
          <p className="text-slate-500 dark:text-slate-400">Visão geral do fluxo de caixa do escritório.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Registro
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-all">
              <Landmark size={24} />
            </div>
            <ArrowUpRight className="text-slate-300" size={20} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Saldo Geral</p>
          <h3 className="text-2xl font-black tabular-nums">{formatCurrency(stats.balance)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Entradas</p>
          <h3 className="text-2xl font-black text-green-600 tabular-nums">{formatCurrency(stats.income)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl">
              <TrendingDown size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Saídas</p>
          <h3 className="text-2xl font-black text-red-600 tabular-nums">{formatCurrency(stats.expense)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm group hover:scale-[1.02] transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pendente</p>
          <h3 className="text-2xl font-black text-amber-600 tabular-nums">{formatCurrency(stats.pending)}</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
          {(['todos', 'receita', 'despesa'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === t ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Data</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-8 py-5 text-sm font-medium text-slate-500">
                      {new Date(record.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${record.type === 'receita' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                          {record.type === 'receita' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white capitalize">{record.title}</p>
                          {record.case_id && <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Vinc. Processo</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold capitalize">
                        {record.category}
                      </span>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black tabular-nums ${record.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'receita' ? '+' : '-'} {formatCurrency(record.amount)}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.status === 'pago' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                        record.status === 'pendente' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                          'bg-red-100 text-red-600 dark:bg-red-900/30'
                        }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-all opacity-0 group-hover:opacity-100">
                        <Plus size={18} className="rotate-45" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateFinanceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default Finance;
