
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { FinanceRecord } from '../types.ts';
import { ReportConfig } from './generateFinancialReportPDF.ts';

export async function generateFinancialReportExcel(
  config: ReportConfig,
  revenues: FinanceRecord[],
  expenses: FinanceRecord[],
  kpis: any
) {
  const wb = XLSX.utils.book_new();

  // 1. Aba de Resumo
  const summaryData = [
    ['Resumo Financeiro - LegalTech'],
    [`Período: ${format(config.startDate, 'dd/MM/yyyy')} a ${format(config.endDate, 'dd/MM/yyyy')}`],
    [],
    ['INDICADOR', 'VALOR'],
    ['Total de Receitas', kpis.totalRev],
    ['Total de Despesas', kpis.totalExp],
    ['Saldo Líquido', kpis.balance],
    ['Receita Recorrente (MRR)', kpis.mrr],
    ['Taxa de Inadimplência (%)', kpis.defaultRate],
    ['Ticket Médio', kpis.avgTicket]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Executivo');

  // 2. Aba de Receitas
  if (config.includeRevenues) {
    const revData = revenues.map(r => ({
      'Cliente': r.client?.name || 'N/A',
      'Categoria': r.category,
      'Valor': r.amount,
      'Vencimento': format(new Date(r.due_date), 'dd/MM/yyyy'),
      'Status': r.status,
      'Pagamento': r.paid_date ? format(new Date(r.paid_date), 'dd/MM/yyyy') : '-'
    }));
    const wsRev = XLSX.utils.json_to_sheet(revData);
    XLSX.utils.book_append_sheet(wb, wsRev, 'Receitas');
  }

  // 3. Aba de Despesas
  if (config.includeExpenses) {
    const expData = expenses.map(e => ({
      'Categoria': e.category,
      'Descrição': e.notes || '-',
      'Valor': e.amount,
      'Vencimento': format(new Date(e.due_date), 'dd/MM/yyyy'),
      'Status': e.status
    }));
    const wsExp = XLSX.utils.json_to_sheet(expData);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Despesas');
  }

  const fileName = `relatorio-financeiro-${format(config.startDate, 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
