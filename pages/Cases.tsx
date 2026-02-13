import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FolderPlus,
  ChevronDown,
  ChevronUp,
  Table2,
  LayoutGrid,
  Search,
  Plus,
  Loader2,
} from 'lucide-react';
import { caseService } from '../services/caseService';
import { clientService } from '../services/clientService';
import { CaseWithRelations } from '../types';
import { seedCases } from '../utils/seedCases';
import { KPICard } from '../components/cases/KPICard';
import { SuccessRateCard } from '../components/cases/SuccessRateCard';
import { StatusBarChart } from '../components/cases/StatusBarChart';
import { TypePieChart } from '../components/cases/TypePieChart';
import { CaseTable } from '../components/cases/CaseTable';
import { CaseCard } from '../components/cases/CaseCard';
import { CaseFilters } from '../components/cases/CaseFilters';
import { CreateCaseModal } from '../components/cases/CreateCaseModal';
import { CaseDetailsModal } from '../components/cases/CaseDetailsModal';
import { formatCurrency } from '../utils/formatters';

const Cases: React.FC = () => {
  const queryClient = useQueryClient();
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return (localStorage.getItem('cases_view') as 'table' | 'cards') || 'table';
  });
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    types: [] as string[],
    status: [] as string[],
  });

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await caseService.getCases();
      setCases(data as CaseWithRelations[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    seedCases();
    loadCases();
  }, [loadCases]);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        c.process_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.client?.name &&
          c.client.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType =
        filters.types.length === 0 ||
        filters.types.some((t) => t.toLowerCase() === c.type.toLowerCase());
      const matchStatus =
        filters.status.length === 0 ||
        filters.status.some((s) => s.toLowerCase() === c.status.toLowerCase());

      return matchSearch && matchType && matchStatus;
    });
  }, [cases, searchTerm, filters]);

  const stats = useMemo(() => {
    const active = cases.filter((c) => c.status === 'andamento').length;
    const totalValue = cases.reduce(
      (acc, c) => acc + (Number(c.value) || 0),
      0
    );

    const concluded = cases.filter(
      (c) => c.status === 'encerrado' || c.status === 'arquivado'
    );
    const wins = concluded.filter(
      (c) => c.outcome === 'ganho' || c.outcome === 'acordo'
    ).length;
    const losses = concluded.filter((c) => c.outcome === 'perdido').length;

    // This logic relies on localStorage for deadlines as per backup,
    // but in a real app would use useDeadlines hook. Staying faithful to backup for now.
    const deadlinesStr = localStorage.getItem('legaltech_deadlines');
    let deadCount = 0;
    if (deadlinesStr) {
      const deadlines = JSON.parse(deadlinesStr);
      const today = new Date().toDateString();
      deadCount = Array.isArray(deadlines)
        ? deadlines.filter(
            (d: any) =>
              d.status === 'pendente' &&
              new Date(d.deadline_date).toDateString() === today
          ).length
        : 0;
    }

    return {
      active,
      totalValue,
      wins,
      losses,
      totalConcluded: concluded.length,
      todayDeadlines: deadCount,
    };
  }, [cases]);

  const formattedTotalValue = useMemo(() => {
    if (stats.totalValue >= 1000000) {
      return `R$ ${(stats.totalValue / 1000000).toFixed(1)} Mi`;
    }
    if (stats.totalValue >= 1000) {
      return `R$ ${(stats.totalValue / 1000).toFixed(1)} Mil`;
    }
    return formatCurrency(stats.totalValue);
  }, [stats.totalValue]);

  const handleSaveSuccess = async (clientId: string) => {
    if (clientId) {
      const clients = await clientService.getClients();
      const clientIndex = clients.findIndex((c) => c.id === clientId);
      if (clientIndex !== -1) {
        const updatedClient = {
          ...clients[clientIndex],
          process_count: (clients[clientIndex].process_count || 0) + 1,
        };
        await clientService.updateClient(clientId, updatedClient);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    loadCases();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-navy-950 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">
            Processos e Casos
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Gerencie todos os processos judiciais do escritório.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/30 transition-all active:scale-95 group btn-electric"
        >
          <FolderPlus
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          Novo Processo
        </button>
      </header>

      <div className="bg-white dark:bg-navy-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm glass-card">
        <button
          onClick={() => setIsDashboardOpen(!isDashboardOpen)}
          className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
              Dashboard Processual
            </h3>
            <span className="px-3 py-1 bg-slate-100 dark:bg-navy-800 rounded-full text-[10px] font-black text-slate-500 border border-slate-200 dark:border-white/5 uppercase">
              {cases.length} processos totais
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-800 text-slate-400">
            {isDashboardOpen ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </div>
        </button>

        {isDashboardOpen && (
          <div className="p-8 border-t border-slate-100 dark:border-white/10 animate-in slide-in-from-top-2 duration-300 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Processos Ativos"
                value={stats.active}
                icon={<FolderPlus size={20} />}
                subtitle="Tramitação ativa"
                color="blue"
              />
              <SuccessRateCard casesWon={stats.wins} casesLost={stats.losses} />
              <KPICard
                title="Valor em Causa"
                value={formattedTotalValue}
                icon={<Plus size={20} />}
                subtitle="Somatória sob gestão"
                color="orange"
              />
              <KPICard
                title="Pendências"
                value={stats.todayDeadlines}
                icon={<Plus size={20} />}
                subtitle="Prazos para hoje"
                color="red"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StatusBarChart cases={cases} />
              <TypePieChart cases={cases} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-lg">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por número, cliente, vara ou observações..."
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-white/10 mx-2" />
            <div className="flex bg-white dark:bg-navy-900 p-1 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
              <button
                onClick={() => {
                  setViewMode('table');
                  localStorage.setItem('cases_view', 'table');
                }}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lista"
              >
                <Table2 size={20} />
              </button>
              <button
                onClick={() => {
                  setViewMode('cards');
                  localStorage.setItem('cases_view', 'cards');
                }}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                title="Cards"
              >
                <LayoutGrid size={20} />
              </button>
            </div>
          </div>
        </div>

        <CaseFilters onFilterChange={setFilters} />

        <div className="min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                className="animate-spin text-primary-600 mb-4"
                size={40}
              />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                Carregando processos...
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <CaseTable
              cases={filteredCases}
              onRowClick={(id) => setSelectedCaseId(id)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCases.map((c) => (
                <CaseCard
                  key={c.id}
                  caseData={c}
                  onClick={() => setSelectedCaseId(c.id)}
                />
              ))}
              {filteredCases.length === 0 && (
                <div className="col-span-full py-32 bg-white dark:bg-navy-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center glass-card">
                  <Search size={48} className="text-slate-200 mb-4" />
                  <p className="text-slate-400 italic font-medium">
                    Nenhum processo atende aos critérios da busca.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
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
