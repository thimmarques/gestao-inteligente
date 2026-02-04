
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign, TrendingUp, Users, Clock,
  Search, FileText, Download, Trash2, Loader2, Plus
} from 'lucide-react';
import { isWithinInterval, format } from 'date-fns';
import confetti from 'canvas-confetti';

import { Client, CaseWithRelations, Deadline, ScheduleEvent, Report } from '../types';
import { ReportTypeCard } from '../components/reports/ReportTypeCard';
import { FinancialReportModal } from '../components/reports/FinancialReportModal';
import { ProductivityReportModal } from '../components/reports/ProductivityReportModal';
import { ClientsReportModal } from '../components/reports/ClientsReportModal';
import { DeadlinesReportModal } from '../components/reports/DeadlinesReportModal';
import { ReportGenerationProgress } from '../components/reports/ReportGenerationProgress';
import { ReportsEmptyState } from '../components/reports/ReportsEmptyState';

import { generateFinancialReportPDF, ReportConfig } from '../utils/generateFinancialReportPDF';
import { generateFinancialReportExcel } from '../utils/generateFinancialReportExcel';
import { generateProductivityReportPDF } from '../utils/generateProductivityReportPDF';
import { generateProductivityReportExcel } from '../utils/generateProductivityReportExcel';
import { generateClientsReportExcel } from '../utils/generateClientsReportExcel';
import { generateClientsReportPDF } from '../utils/generateClientsReportPDF';
import { generateDeadlinesReportPDF } from '../utils/generateDeadlinesReportPDF';
import { generateDeadlinesReportExcel } from '../utils/generateDeadlinesReportExcel';
import { validateReportPeriod } from '../utils/reportValidation';

import { financeService } from '../services/financeService';
import { clientService } from '../services/clientService';
import { caseService } from '../services/caseService';
import { deadlineService } from '../services/deadlineService';
import { scheduleService } from '../services/scheduleService';
import { useApp } from '../contexts/AppContext';

type ReportType = 'financeiro' | 'produtividade' | 'clientes' | 'prazos';

const Reports: React.FC = () => {
  const { lawyer } = useApp();
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
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const handleGenerateReport = async (type: ReportType, config: ReportConfig) => {
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
        { p: 10, s: 'Conectando ao banco de dados...' },
        { p: 30, s: 'Extraindo registros e metadados...' },
      ]);

      if (type === 'financeiro') {
        const finances = await financeService.getFinances();
        const filteredFinances = finances.filter(f => {
          const date = new Date(f.due_date);
          return isWithinInterval(date, { start: config.startDate, end: config.endDate });
        });

        const revenues = filteredFinances.filter(f => f.type === 'receita');
        const expenses = filteredFinances.filter(f => f.type === 'despesa');
        const totalRev = revenues.reduce((s, r) => s + r.amount, 0);
        const totalExp = expenses.reduce((s, e) => s + e.amount, 0);

        const clients = await clientService.getClients();
        const mrr = clients.filter(c => c.status === 'ativo').reduce((s, c) => s + (c.financial_profile?.retainer_fee || 0), 0);
        const particularCount = clients.filter(c => c.type === 'particular').length;
        const avgTicket = particularCount > 0 ? totalRev / particularCount : 0;
        const kpis = { totalRev, totalExp, balance: totalRev - totalExp, mrr, avgTicket, defaultRate: 4.2 };

        await simulateProgress([{ p: 70, s: 'Gerando arquivos...' }]);
        if (config.format === 'pdf') {
          fileName = await generateFinancialReportPDF(config, revenues, expenses, kpis);
        } else {
          fileName = await generateFinancialReportExcel(config, revenues, expenses, kpis);
        }
      }
      else if (type === 'produtividade') {
        const cases = await caseService.getCases();
        const schedules = await scheduleService.getSchedules();
        const deadlines = await deadlineService.getDeadlines();

        await simulateProgress([{ p: 70, s: 'Processando indicadores...' }]);
        if (config.format === 'pdf') {
          fileName = await generateProductivityReportPDF(config, (cases as any), (schedules as any), (deadlines as any));
        } else {
          fileName = await generateProductivityReportExcel(config, (cases as any), (schedules as any), (deadlines as any));
        }
      }
      else if (type === 'clientes') {
        const clients = await clientService.getClients();
        const finances = await financeService.getFinances();

        await simulateProgress([{ p: 70, s: 'Compilando listagem...' }]);
        if (config.format === 'excel') {
          fileName = await generateClientsReportExcel(config, (clients as any), (finances as any));
        } else {
          fileName = await generateClientsReportPDF(config, (clients as any), (finances as any));
        }
      }
      else if (type === 'prazos') {
        const deadlines = await deadlineService.getDeadlines();

        await simulateProgress([{ p: 70, s: 'Analizando protocolos...' }]);
        if (config.format === 'pdf') {
          fileName = await generateDeadlinesReportPDF(config, (deadlines as any));
        } else {
          fileName = await generateDeadlinesReportExcel(config, (deadlines as any));
        }
      }

      await simulateProgress([
        { p: 90, s: 'Finalizando...' },
        { p: 100, s: 'Sucesso!' }
      ]);

      const newReport: Report = {
        id: crypto.randomUUID(),
        type,
        lawyer_id: lawyer?.id || '',
        period_start: config.startDate.toISOString(),
        period_end: config.endDate.toISOString(),
        format: config.format as any,
        file_url: fileName,
        file_size: '1.2 MB',
        created_at: new Date().toISOString()
      };

      const history = JSON.parse(localStorage.getItem('legaltech_reports') || '[]');
      localStorage.setItem('legaltech_reports', JSON.stringify([newReport, ...history]));

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      setIsGenerating(false);
      loadHistory();

    } catch (error) {
      console.error('Erro na geração:', error);
      alert('Houve um erro técnico ao gerar o relatório.');
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
    handleGenerateReport(report.type, config);
  };

  const handleDeleteHistory = (id: string) => {
    if (confirm("Remover este relatório do histórico?")) {
      const filtered = recentReports.filter(r => r.id !== id);
      localStorage.setItem('legaltech_reports', JSON.stringify(filtered));
      loadHistory();
    }
  };

  const reportTypes = [
    {
      type: 'financeiro' as const,
      title: 'Financeiro',
      description: 'Fluxo de caixa, MRR, ticket médio e saúde financeira.',
      icon: <DollarSign />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-600',
      onGenerate: () => setActiveModal('financeiro')
    },
    {
      type: 'produtividade' as const,
      title: 'Produtividade',
      description: 'Performance, tempo médio e taxas de êxito.',
      icon: <TrendingUp />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600',
      onGenerate: () => setActiveModal('produtividade')
    },
    {
      type: 'clientes' as const,
      title: 'Carteira Clientes',
      description: 'Demografia, satisfação e distribuição.',
      icon: <Users />,
      defaultFormat: 'excel' as const,
      iconBgColor: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600',
      onGenerate: () => setActiveModal('clientes')
    },
    {
      type: 'prazos' as const,
      title: 'Prazos Judiciais',
      description: 'Compliance, antecedência e atrasos crônicos.',
      icon: <Clock />,
      defaultFormat: 'pdf' as const,
      iconBgColor: 'bg-orange-50 dark:bg-orange-900/30',
      iconColor: 'text-orange-600',
      onGenerate: () => setActiveModal('prazos')
    }
  ];

  const filteredHistory = useMemo(() => {
    return recentReports.filter(r =>
      r.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recentReports, searchTerm]);

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-10 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight">Hub de Relatórios</h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Análise estratégica baseada em dados reais.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar histórico..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportTypes.map(report => (
          <ReportTypeCard key={report.type} {...report} />
        ))}
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black dark:text-white tracking-tight">Histórico Recente</h2>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[250px]">
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Período</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHistory.map(report => (
                    <tr key={report.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${report.type === 'financeiro' ? 'bg-green-500' :
                            report.type === 'produtividade' ? 'bg-blue-500' :
                              report.type === 'clientes' ? 'bg-purple-500' : 'bg-orange-500'
                            }`}>
                            <FileText size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white capitalize">{report.type}</p>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.format}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 hidden md:table-cell">
                        <span className="text-sm text-slate-500">
                          {format(new Date(report.period_start), 'dd/MM/yy')} - {format(new Date(report.period_end), 'dd/MM/yy')}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold dark:text-slate-200 uppercase">
                        {format(new Date(report.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleDownloadFromHistory(report)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-primary-600 transition-all">
                            <Download size={18} />
                          </button>
                          <button onClick={() => handleDeleteHistory(report.id)} className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-all">
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

      {isGenerating && (
        <ReportGenerationProgress isGenerating={isGenerating} progress={genProgress} currentStep={genStep} />
      )}

      {activeModal === 'financeiro' && <FinancialReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('financeiro', cfg)} />}
      {activeModal === 'produtividade' && <ProductivityReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('produtividade', cfg)} />}
      {activeModal === 'clientes' && <ClientsReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('clientes', cfg)} />}
      {activeModal === 'prazos' && <DeadlinesReportModal isOpen={true} onClose={() => setActiveModal(null)} onGenerate={(cfg) => handleGenerateReport('prazos', cfg)} />}
    </div>
  );
};

export default Reports;
