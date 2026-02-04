
import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, Search,
  Plus, Filter, Loader2, ChevronRight, Scale, User, MoreHorizontal,
  Bell, BellOff
} from 'lucide-react';
import { useDeadlines } from '../hooks/useQueries';
import { deadlineService } from '../services/deadlineService';
import { DeadlineWithRelations, Deadline } from '../types';
import { calculateDaysRemaining, getDeadlineStatus } from '../utils/deadlineCalculations';
import { CreateDeadlineModal } from '../components/deadlines/CreateDeadlineModal';

const Deadlines: React.FC = () => {
  const { data: deadlines = [], isLoading, refetch } = useDeadlines();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'concluído' | 'vencido'>('pendente');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDeadlines = useMemo(() => {
    let filtered = deadlines.filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.case?.process_number.includes(searchTerm);
      const daysRemaining = calculateDaysRemaining(d.deadline_date);
      const isOverdue = daysRemaining < 0 && d.status !== 'concluído';

      const deadlineStatus = d.status === 'concluído' ? 'concluído' : (isOverdue ? 'vencido' : 'pendente');
      const matchesStatus = statusFilter === 'todos' || deadlineStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime());
  }, [deadlines, searchTerm, statusFilter]);

  const handleToggleStatus = async (deadline: Deadline) => {
    try {
      await deadlineService.updateDeadline(deadline.id, {
        status: deadline.status === 'concluído' ? 'pendente' : 'concluído'
      });
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDeadline = async (data: any) => {
    try {
      await deadlineService.createDeadline(data);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar prazo.');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Prazos</h1>
          <p className="text-slate-500 dark:text-slate-400">Controle rigoroso de prazos processuais.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Novo Prazo
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Título do prazo ou processo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl overflow-x-auto">
          {(['todos', 'pendente', 'concluído', 'vencido'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${statusFilter === s ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando prazos...</p>
        </div>
      ) : filteredDeadlines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredDeadlines.map(d => {
            const daysRemaining = calculateDaysRemaining(d.deadline_date);
            const isLate = daysRemaining < 0 && d.status !== 'concluído';
            const isToday = daysRemaining === 0 && d.status !== 'concluído';

            return (
              <div key={d.id} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${isLate ? 'border-red-200 dark:border-red-900/30 bg-red-50/10' : 'border-slate-200 dark:border-slate-800'} shadow-sm hover:shadow-xl transition-all group overflow-hidden relative`}>
                {isLate && <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${d.priority === 'urgente' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                          d.priority === 'alta' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                            d.priority === 'média' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                              'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}>
                        {d.priority}
                      </span>
                      {isLate ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest animate-pulse">
                          <AlertTriangle size={12} /> Prazo Vencido
                        </span>
                      ) : isToday ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <Clock size={12} /> Vence Hoje!
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h3 className={`text-lg font-black dark:text-white ${d.status === 'concluído' ? 'line-through opacity-50' : ''}`}>{d.title}</h3>
                      <span className="hidden md:block text-slate-300">•</span>
                      <p className="text-sm font-mono text-slate-500">{d.case?.process_number}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-primary-500" />
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data Limite</p>
                          <p className="text-sm font-bold dark:text-slate-100">{new Date(d.deadline_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cliente</p>
                          <p className="text-sm font-bold dark:text-slate-100">{d.case?.client?.name || 'Não vinculado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={isLate ? 'text-red-500' : 'text-slate-400'} />
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</p>
                          <p className={`text-sm font-black ${isLate ? 'text-red-600' : 'text-slate-800 dark:text-slate-100 uppercase'}`}>
                            {d.status === 'concluído' ? 'Concluído' : (isLate ? `${Math.abs(daysRemaining)} dias em atraso` : `${daysRemaining} dias restantes`)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => handleToggleStatus(d)}
                      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${d.status === 'concluído'
                          ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                      <CheckCircle2 size={18} />
                      {d.status === 'concluído' ? 'Concluído' : 'Concluir'}
                    </button>
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
          <CheckCircle2 size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-lg font-serif italic">Nenhum prazo {statusFilter === 'todos' ? '' : statusFilter} para exibir.</p>
        </div>
      )}

      {isModalOpen && (
        <CreateDeadlineModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveDeadline}
        />
      )}
    </div>
  );
};

export default Deadlines;
