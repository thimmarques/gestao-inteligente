
import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, Search,
  Plus, Filter, Loader2, ChevronRight, Scale, User, MoreHorizontal,
  Bell, BellOff
} from 'lucide-react';
import { useDeadlines } from '../hooks/useQueries';
import { deadlineService } from '../services/deadlineService';
import { DeadlineWithRelations, Deadline } from '../types';
import { calculateDaysRemaining } from '../utils/deadlineCalculations';
import { CreateDeadlineModal } from '../components/deadlines/CreateDeadlineModal';

const Deadlines: React.FC = () => {
  const { data: deadlines = [], isLoading } = useDeadlines();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'concluído' | 'vencido'>('pendente');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredDeadlines = useMemo(() => {
    const filtered = deadlines.filter(d => {
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
    } catch (error) {
      console.error('Error updating deadline status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Prazos Processuais</h1>
          <p className="text-slate-500">Gerencie e acompanhe todos os prazos do escritório</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          Novo Prazo
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por título ou número do processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-transparent border-none focus:ring-0 dark:text-white"
            />
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2 px-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="concluído">Concluídos</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeadlines.map((deadline) => {
          const daysRemaining = calculateDaysRemaining(deadline.deadline_date);
          const isLate = daysRemaining < 0 && deadline.status !== 'concluído';

          return (
            <div
              key={deadline.id}
              className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border ${isLate ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'} shadow-sm hover:shadow-xl transition-all group overflow-hidden relative`}
            >
              {isLate && (
                <div className="absolute top-0 right-0 p-2">
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-1.5 rounded-lg">
                    <AlertTriangle size={16} />
                  </span>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl">
                    <Scale className="text-primary-600" size={24} />
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${isLate ? 'text-red-600' : 'text-primary-600 uppercase tracking-widest'}`}>
                      {daysRemaining === 0 ? 'VENCE HOJE' : isLate ? `${Math.abs(daysRemaining)} dias em atraso` : `${daysRemaining} dias restantes`}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar size={12} className="text-slate-400" />
                      <p className="text-xs font-bold text-slate-500">
                        {new Date(deadline.deadline_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {deadline.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User size={12} className="text-slate-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                      {deadline.case?.process_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(deadline)}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${deadline.status === 'concluído'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                          : 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 hover:bg-primary-100'
                        }`}
                    >
                      {deadline.status === 'concluído' ? (
                        <>
                          <CheckCircle2 size={12} />
                          Concluído
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          Pendente
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateDeadlineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default Deadlines;
