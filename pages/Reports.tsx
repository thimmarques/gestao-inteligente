
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign, TrendingUp, Users, Clock,
  ChevronDown, Search, History, FileText, Download,
  Filter, Calendar, BarChart3, Star, Zap, Trash2, ExternalLink,
  FileCheck, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';
import { isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import confetti from 'canvas-confetti';

import { FinanceRecord, Client, Case, CaseWithRelations, Deadline, ScheduleEvent, Report } from '../types.ts';
import { formatCurrency, estimateFileSize, formatFileSize } from '../utils/formatters.ts';
import { ReportTypeCard } from '../../components/reports/ReportTypeCard.tsx';
import { FinancialReportModal } from '../../components/reports/FinancialReportModal.tsx';
import { ProductivityReportModal } from '../../components/reports/ProductivityReportModal.tsx';
import { ClientsReportModal } from '../../components/reports/ClientsReportModal.tsx';
import { DeadlinesReportModal } from '../../components/reports/DeadlinesReportModal.tsx';
import { ReportGenerationProgress } from '../../components/reports/ReportGenerationProgress.tsx';
import { ReportsEmptyState } from '../../components/reports/ReportsEmptyState.tsx';

import { generateFinancialReportPDF, ReportConfig } from '../utils/generateFinancialReportPDF.ts';
import { generateFinancialReportExcel } from '../utils/generateFinancialReportExcel.ts';
import { generateProductivityReportPDF } from '../utils/generateProductivityReportPDF.ts';
import { generateProductivityReportExcel } from '../utils/generateProductivityReportExcel.ts';
import { generateClientsReportExcel } from '../utils/generateClientsReportExcel.ts';
import { generateClientsReportPDF } from '../utils/generateClientsReportPDF.ts';
import { generateDeadlinesReportPDF } from '../utils/generateDeadlinesReportPDF.ts';
import { generateDeadlinesReportExcel } from '../utils/generateDeadlinesReportExcel.ts';
import { saveReportToHistory } from '../utils/saveReportToHistory.ts';
import { validateReportPeriod } from '../utils/reportValidation.ts';

type ReportType = 'financeiro' | 'produtividade' | 'clientes' | 'prazos';

const Reports: React.FC = () => {
  const [activeModal, setActiveModal] = useState<ReportType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState('');

  const loadHistory = useCallback(() => {
    const raw = localStorage.getItem('legaltech_reports');
    if (raw) setRecentReports(JSON.parse(raw));
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const simulateProgress = async (steps: { p: number, s: string }[]) => {
    for (const step of steps) {
      setGenProgress(step.p);
      setGenStep(step.s);
      await new Promise(r => setTimeout(r, 350));
    }
  };

  const handleGenerateReport = async (type: ReportType, config: ReportConfig) => {
    // Validação de Período
    const validation = validateReportPeriod(config.startDate, config.endDate);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    setActiveModal(null);
    setIsGenerating(true);
    setGenProgress(0);

    try {
      let fileName = '';

      await simulateProgress([
        { p: 10, s: 'Iniciando extração de dados...' },
        { p: 30, s: 'Consolidando registros de banco de dados...' },
      ]);

      if (type === 'financeiro') {
        const rawFinances = JSON.parse(localStorage.getItem('legaltech_finances') || '[]');
        const clients: Client[] = JSON.parse(localStorage.getItem('legaltech_clients') || '[]');
        const cases: CaseWithRelations[] = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');

        const finances = rawFinances.filter((f: any) => {
          const date = new Date(f.due_date);
          return isWithinInterval(date, { start: config.startDate, end: config.endDate });
        }).map((f: any) => ({
          ...f,
          client: f.client_id ? clients.find(c => c.id === f.client_id) : null,
          case: f.case_id ? cases.find(c => c.id === f.case_id) : null
        }));

        const revenues = finances.filter((f: any) => f.type === 'receita');
        const expenses = finances.filter((f: any) => f.type === 'despesa');
        const totalRev = revenues.reduce((s: number, r: any) => s + r.amount, 0);
        const totalExp = expenses.reduce((s: number, e: any) => s + e.amount, 0);
        const mrr = clients.filter(c => c.status === 'ativo').reduce((s, c) => s + (c.financial_profile?.retainer_fee || 0), 0);
        const particularCount = clients.filter(c => c.type === 'particular').length;
        const avgTicket = particularCount > 0 ? totalRev / particularCount : 0;
        const kpis = { totalRev, totalExp, balance: totalRev - totalExp, mrr, avgTicket, defaultRate: 4.2 };

        await simulateProgress([{ p: 60, s: 'Formatando documento final...' }]);
        if (config.format === 'pdf') {
          fileName = await generateFinancialReportPDF(config, revenues, expenses, kpis);
        } else {
          fileName = await generateFinancialReportExcel(config, revenues, expenses, kpis);
        }

        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
      else if (type === 'produtividade') {
        const cases: Case[] = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
        const schedules: ScheduleEvent[] = JSON.parse(localStorage.getItem('legaltech_schedules') || '[]');
        const deadlines: Deadline[] = JSON.parse(localStorage.getItem('legaltech_deadlines') || '[]');

        await simulateProgress([{ p: 60, s: 'Calculando índices de desempenho...' }]);
        if (config.format === 'pdf') {
          fileName = await generateProductivityReportPDF(config, cases, schedules, deadlines);
        } else {
          fileName = await generateProductivityReportExcel(config, cases, schedules, deadlines);
        }
      }
      else if (type === 'clientes') {
        const clients: Client[] = JSON.parse(localStorage.getItem('legaltech_clients') || '[]');
        const finances: FinanceRecord[] = JSON.parse(localStorage.getItem('legaltech_finances') || '[]');

        await simulateProgress([{ p: 60, s: 'Compilando base de carteira...' }]);
        if (config.format === 'excel') {
          fileName = await generateClientsReportExcel(config, clients, finances);
        } else {
          fileName = await generateClientsReportPDF(config, clients, finances);
        }
      }
      else if (type === 'prazos') {
        const deadlines: Deadline[] = JSON.parse(localStorage.getItem('legaltech_deadlines') || '[]');

        await simulateProgress([{ p: 60, s: 'Validando histórico de protocolos...' }]);
        if (config.format === 'pdf') {
          fileName = await generateDeadlinesReportPDF(config, deadlines);
        } else {
          fileName = await generateDeadlinesReportExcel(config, deadlines);
        }
      }

      await simulateProgress([
        { p: 90, s: 'Salvando no histórico...' },
        { p: 100, s: 'Concluído!' }
      ]);

      saveReportToHistory({
        type,
        periodStart: config.startDate,
        periodEnd: config.endDate,
        format: config.format,
        fileName
      });

      await new Promise(r => setTimeout(r, 500));
      setIsGenerating(false);
      loadHistory();

    } catch (error) {
      console.error('Erro na geração:', error);
      alert('Houve um erro técnico ao processar seu pedido. Tente novamente.');
      setIsGenerating(false);
    }
  };

  const handleDownloadFromHistory = async (report: Report) => {
    const config: ReportConfig = {
      startDate: new Date(report.period_start),
      endDate: new Date(report.period_end),
      includeRevenues: true,
      includeExpenses: true,
      includeCharts: true,
      includeSummary: true,
      includeOverdue: true,
      format: report.format as any
    };

    // Chamamos com o tipo explicitamente vindo do registro histórico
    handleGenerateReport(report.type, config);
  };

  const handleDeleteHistory = (id: string) => {
    if (confirm("Remover este relatório do histórico?")) {
      const raw = localStorage.getItem('legaltech_reports');
      if (raw) {
        const reports: Report[] = JSON.parse(raw);
        const filtered = reports.filter(r => r.id !== id);
        localStorage.setItem('legaltech_reports', JSON.stringify(filtered));
        loadHistory();
      }
    }
  };

  const reportTypes = [
    {
      type: 'financeiro' as const,
      title: 'Financeiro',
      description: 'Análise de fluxo de caixa, MRR, ticket médio e saúde financeira.',
      icon: <DollarSign />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-600',
      onGenerate: () => setActiveModal('financeiro')
    },
    {
      type: 'produtividade' as const,
      title: 'Produtividade',
      description: 'Performance da equipe, vazão de processos e taxas de êxito.',
      icon: <TrendingUp />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      onGenerate: () => setActiveModal('produtividade')
    },
    {
      type: 'clientes' as const,
      title: 'Carteira Clientes',
      description: 'Dados demográficos, satisfação e distribuição por tipo de contrato.',
      icon: <Users />,
      defaultFormat: 'excel' as const,
      iconBgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      onGenerate: () => setActiveModal('clientes')
    },
    {
      type: 'prazos' as const,
      title: 'Prazos Judiciais',
      description: 'Histórico de compliance, média de antecedência e atrasos críticos.',
      icon: <Clock />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-orange-50 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
      onGenerate: () => setActiveModal('prazos')
    }
  ];

  const filteredHistory = useMemo(() => {
    return recentReports.filter(r =>
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.file_url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentReports, searchTerm]);

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-10 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-24">

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight">Hub de Relatórios</h1>
          <p className="text-slate-500 font-medium max-w-xl text-sm md:text-base">Dados inteligentes para decisões estratégicas.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar no histórico..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm shadow-sm"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {reportTypes.map(report => (
          <ReportTypeCard key={report.type} {...report} />
        ))}
      </div>

      <section id="recent-reports" className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary-600 rounded-full" />
          <h2 className="text-xl font-black dark:text-white tracking-tight">Histórico de Relatórios</h2>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[250px]">
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Período</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Geração</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center hidden sm:table-cell">Formato</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map(report => (
                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${report.type === 'financeiro' ? 'bg-green-500' :
                              report.type === 'produtividade' ? 'bg-blue-500' :
                                report.type === 'clientes' ? 'bg-purple-500' : 'bg-orange-500'
                            }`}>
                            <FileText size={18} />
                          </div>
                          <span className="text-sm font-bold dark:text-white capitalize">{report.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {format(new Date(report.period_start), 'dd/MM/yy')} a {format(new Date(report.period_end), 'dd/MM/yy')}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold dark:text-slate-200">
                        {format(new Date(report.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-6 text-center hidden sm:table-cell">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${report.format === 'pdf' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                          }`}>
                          {report.format}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleDownloadFromHistory(report)} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-primary-600 shadow-sm transition-all" title="Baixar Novamente">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleDeleteHistory(report.id)} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-red-500 shadow-sm transition-all" title="Excluir Histórico">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <ReportsEmptyState />
          )}
        </div>
      </section>

      <ReportGenerationProgress isGenerating={isGenerating} progress={genProgress} currentStep={genStep} />

      {activeModal === 'financeiro' && <FinancialReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('financeiro', cfg)} />}
      {activeModal === 'produtividade' && <ProductivityReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('produtividade', cfg)} />}
      {activeModal === 'clientes' && <ClientsReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('clientes', cfg)} />}
      {activeModal === 'prazos' && <DeadlinesReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('prazos', cfg)} />}
    </div>
  );
};

export default Reports;
