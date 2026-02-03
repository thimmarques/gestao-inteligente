
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Clock, Plus, Search, ChevronRight, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { Deadline } from '../types.ts';
import { deadlineService } from '../services/deadlineService.ts';
import { seedDeadlines } from '../utils/seedDeadlines.ts';
import { getDeadlineStatus } from '../utils/deadlineCalculations.ts';
import { filterDeadlines, sortDeadlines } from '../utils/deadlineFilters.ts';
import { logAction } from '../utils/auditLogger.ts';
import { deadlineLogger } from '../utils/deadlineLogger.ts';
import { useApp } from '../contexts/AppContext.tsx';

import { DeadlineStatusFilters } from '../../components/deadlines/DeadlineStatusFilters.tsx';
import { DeadlineFiltersBar } from '../../components/deadlines/DeadlineFilters.tsx';
import { ViewToggle } from '../../components/deadlines/ViewToggle.tsx';
import { DeadlineSorter } from '../../components/deadlines/DeadlineSorter.tsx';
import { DeadlineList } from '../../components/deadlines/DeadlineList.tsx';
import { DeadlineCard } from '../../components/deadlines/DeadlineCard.tsx';
import { CreateDeadlineModal } from '../../components/deadlines/CreateDeadlineModal.tsx';
import { DeadlineDetailsModal } from '../../components/deadlines/DeadlineDetailsModal.tsx';

const Deadlines: React.FC = () => {
  const { lawyer } = useApp();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(() => {
    return (localStorage.getItem('deadlines_view') as any) || 'list';
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);

  const [filters, setFilters] = useState<any>({
    search: '',
    statusVisual: ['ok', 'proximo', 'urgente', 'hoje', 'vencido'],
    priority: [],
    caseId: 'todos',
    lawyerId: 'todos'
  });

  const [sort, setSort] = useState<any>({
    field: 'deadline_date',
    direction: 'asc'
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    seedDeadlines();
    const data = await deadlineService.getDeadlines();
    setDeadlines(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = useMemo(() => {
    const stats = { ok: 0, proximo: 0, urgentes: 0, hoje: 0, vencidos: 0, concluidos: 0, total: deadlines.length };
    deadlines.forEach(d => {
      const { status } = getDeadlineStatus(d);
      if (status === 'ok') stats.ok++;
      if (status === 'proximo') stats.proximo++;
      if (status === 'urgente') stats.urgentes++;
      if (status === 'hoje') stats.hoje++;
      if (status === 'vencido') stats.vencidos++;
      if (status === 'concluido') stats.concluidos++;
    });
    return stats;
  }, [deadlines]);

  const filteredData = useMemo(() => {
    const filtered = filterDeadlines(deadlines, filters);
    return sortDeadlines(filtered, sort);
  }, [deadlines, filters, sort]);

  const handleToggleComplete = async (id: string) => {
    const deadline = deadlines.find(d => d.id === id);
    if (!deadline) return;

    const isUrgent = deadline.priority === 'urgente' || deadline.priority === 'alta';
    const userName = lawyer?.name || 'Sistema';

    if (deadline.status !== 'concluído') {
      deadlineLogger.logCompletion(deadline, userName);

      await deadlineService.updateDeadline(id, {
        status: 'concluído',
        completed_at: new Date().toISOString()
      });

      logAction({
        action: 'update',
        entity_type: 'deadline',
        entity_id: id,
        entity_description: `Prazo finalizado: ${deadline.title}`,
        details: { status_anterior: deadline.status, status_atual: 'concluído' },
        criticality: 'importante'
      });

      if (isUrgent) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#ffffff']
        });
      }
    } else {
      deadlineLogger.logReversion(deadline, userName);

      await deadlineService.updateDeadline(id, {
        status: 'pendente',
        completed_at: null
      });

      logAction({
        action: 'update',
        entity_type: 'deadline',
        entity_id: id,
        entity_description: `Prazo revertido para pendente: ${deadline.title}`,
        criticality: 'normal'
      });
    }

    loadData();
  };

  const handleSave = async (data: any) => {
    if (selectedDeadline) {
      await deadlineService.updateDeadline(selectedDeadline.id, data);
    } else {
      await deadlineService.createDeadline({
        ...data,
        lawyer_id: lawyer?.id || 'lawyer-1',
        office_id: 'office-1',
        status: 'pendente'
      });
    }
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deadlineService.deleteDeadline(id);
    loadData();
  };

  const urgentCount = counts.hoje + counts.urgentes;

  return (
    <div className="p-6 md:p-10 space-y-10 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
            <span>LegalTech</span>
            <ChevronRight size={12} />
            <span className="text-primary-600">Gestão de Prazos</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black dark:text-white tracking-tight">Prazos Processuais</h1>
            {urgentCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/20">
                <AlertCircle size={14} />
                {urgentCount} URGENTES
              </div>
            )}
          </div>
          <p className="text-slate-500 font-medium max-w-xl">Acompanhe vencimentos fatais e gerencie prioridades estratégicas.</p>
        </div>

        <button
          onClick={() => { setSelectedDeadline(null); setIsCreateModalOpen(true); }}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary-500/30 transition-all active:scale-95 group"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform" />
          Novo Prazo
        </button>
      </header>

      <section className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <DeadlineStatusFilters
            activeFilters={filters.statusVisual}
            onFilterChange={(st) => setFilters({ ...filters, statusVisual: st })}
            counts={counts}
          />

          <div className="flex items-center gap-3 self-end xl:self-auto">
            <DeadlineSorter currentSort={sort} onChange={setSort} />
            <ViewToggle view={viewMode} onChange={setViewMode} />
            <button
              onClick={loadData}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-primary-600 transition-all"
              title="Sincronizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <DeadlineFiltersBar
          resultsCount={filteredData.length}
          onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
        />
      </section>

      <main className="min-h-[600px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 animate-in fade-in">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Reconciliando Prazos Judiciais...</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-700">
            {viewMode === 'list' ? (
              <DeadlineList
                deadlines={filteredData}
                onCheckComplete={handleToggleComplete}
                onRowClick={(d) => { setSelectedDeadline(d); setIsDetailsModalOpen(true); }}
                onEdit={(d) => { setSelectedDeadline(d); setIsCreateModalOpen(true); }}
                onDelete={handleDelete}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredData.map(d => (
                  <DeadlineCard
                    key={d.id}
                    deadline={d}
                    onComplete={handleToggleComplete}
                    onClick={(d) => { setSelectedDeadline(d); setIsDetailsModalOpen(true); }}
                  />
                ))}
                {filteredData.length === 0 && (
                  <div className="col-span-full py-32 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <Clock size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">Nenhum prazo atende aos filtros atuais.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <CreateDeadlineModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setSelectedDeadline(null); }}
        onSave={handleSave}
        initialData={selectedDeadline}
        mode={selectedDeadline ? 'edit' : 'create'}
      />

      <DeadlineDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedDeadline(null); }}
        deadline={selectedDeadline}
        onEdit={(d) => { setIsDetailsModalOpen(false); setSelectedDeadline(d); setIsCreateModalOpen(true); }}
        onDelete={handleDelete}
        onToggleStatus={handleToggleComplete}
      />
    </div>
  );
};

export default Deadlines;
