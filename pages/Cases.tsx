
import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderPlus, ChevronDown, ChevronUp, Table2, LayoutGrid, Search, Plus
} from 'lucide-react';
import { caseService } from '../services/caseService.ts';
import { Case, CaseWithRelations } from '../types.ts';
import { KPICard } from '../../components/cases/KPICard.tsx';
import { SuccessRateCard } from '../../components/cases/SuccessRateCard.tsx';
import { StatusBarChart } from '../../components/cases/StatusBarChart.tsx';
import { TypePieChart } from '../../components/cases/TypePieChart.tsx';
import { CaseTable } from '../../components/cases/CaseTable.tsx';
import { CaseCard } from '../../components/cases/CaseCard.tsx';
import { CaseFilters } from '../../components/cases/CaseFilters.tsx';
import { CreateCaseModal } from '../../components/cases/CreateCaseModal.tsx';
import { CaseDetailsModal } from '../../components/cases/CaseDetailsModal.tsx';

const Cases: React.FC = () => {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ types: [] as string[], status: [] as string[] });

  useEffect(() => {
    caseService.seedInitialData();
    loadCases();
  }, []);

  const loadCases = async () => {
    const data = await caseService.getCases();
    setCases(data);
  };

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchSearch = c.process_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = filters.types.length === 0 || filters.types.some(t => t.toLowerCase() === c.type.toLowerCase());
      const matchStatus = filters.status.length === 0 || filters.status.some(s => s.toLowerCase() === c.status.toLowerCase());

      return matchSearch && matchType && matchStatus;
    });
  }, [cases, searchTerm, filters]);

  const stats = useMemo(() => {
    const active = cases.filter(c => c.status === 'andamento').length;
    const totalValue = cases.reduce((acc, c) => acc + c.value, 0);

    const concluded = cases.filter(c => c.status === 'encerrado' || c.status === 'arquivado');
    const wins = concluded.filter(c => c.outcome === 'ganho' || c.outcome === 'acordo').length;
    const losses = concluded.filter(c => c.outcome === 'perdido').length;

    const deadlines = JSON.parse(localStorage.getItem('legaltech_deadlines') || '[]');
    const today = new Date().toDateString();
    const todayDeadlines = Array.isArray(deadlines) ? deadlines.filter((d: any) =>
      d.status === 'pendente' && new Date(d.deadline_date).toDateString() === today
    ).length : 0;

    return { active, totalValue, wins, losses, totalConcluded: concluded.length, todayDeadlines };
  }, [cases]);

  return (
    <div className="p-6 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md py-2">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Processos e Casos</h1>
          <p className="text-slate-500 text-sm">Gerencie todos os processos judiciais do escritório.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all active:scale-95"
        >
          <FolderPlus size={20} />
          Novo Processo
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <button
          onClick={() => setIsDashboardOpen(!isDashboardOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="font-bold dark:text-white">Visão Geral</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-500">
              {cases.length} processos no total
            </span>
          </div>
          {isDashboardOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isDashboardOpen && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Processos Ativos"
                value={stats.active}
                icon={<FolderPlus size={20} />}
                subtitle="Em andamento judicial"
                trend={{ value: 0, isPositive: true }}
                color="blue"
              />
              <SuccessRateCard casesWon={stats.wins} casesLost={stats.losses} />
              <KPICard
                title="Valor em Causa"
                value={`R$ ${(stats.totalValue / 1000).toFixed(1)}k`}
                icon={<Plus size={20} />}
                subtitle="Total sob gestão"
                trend={{ value: 0, isPositive: true }}
                color="orange"
              />
              <KPICard
                title="Pendências"
                value={stats.todayDeadlines}
                icon={<Plus size={20} />}
                subtitle="Prazos para hoje"
                trend={{ value: 0, isPositive: false }}
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusBarChart />
              <TypePieChart />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por número, tribunal, observações..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Table2 size={20} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        <CaseFilters onFilterChange={setFilters} />

        <div className="min-h-[400px]">
          {viewMode === 'table' ? (
            <CaseTable
              cases={filteredCases}
              onRowClick={(id) => setSelectedCaseId(id)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCases.map(c => (
                <CaseCard
                  key={c.id}
                  caseData={c}
                  onClick={() => setSelectedCaseId(c.id)}
                />
              ))}
              {filteredCases.length === 0 && (
                <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-500">
                  Nenhum processo encontrado com os filtros atuais.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <CaseDetailsModal
        caseId={selectedCaseId}
        isOpen={!!selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
      />
    </div>
  );
};

export default Cases;
