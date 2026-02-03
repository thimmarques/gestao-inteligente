
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Case, ScheduleEvent, Deadline } from '../types';
import { ReportConfig } from './generateFinancialReportPDF';

export async function generateProductivityReportExcel(
  config: ReportConfig,
  cases: Case[],
  schedules: ScheduleEvent[],
  deadlines: Deadline[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Indicadores
  const metrics = [
    ['Indicadores de Produtividade'],
    [`Período: ${format(config.startDate, 'dd/MM/yyyy')} a ${format(config.endDate, 'dd/MM/yyyy')}`],
    [],
    ['Métrica', 'Quantidade'],
    ['Novos Processos', cases.length],
    ['Eventos/Audiências', schedules.length],
    ['Prazos Totais', deadlines.length],
    ['Prazos Cumpridos', deadlines.filter(d => d.status === 'concluído').length],
    ['Prazos Vencidos', deadlines.filter(d => d.status === 'vencido').length]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(metrics);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Métricas');

  // 2. Detalhes de Processos
  const casesData = cases.map(c => ({
    'Número': c.process_number,
    'Área': c.type,
    'Status': c.status,
    'Data Início': format(new Date(c.started_at), 'dd/MM/yyyy'),
    'Valor': c.value
  }));
  const wsCases = XLSX.utils.json_to_sheet(casesData);
  XLSX.utils.book_append_sheet(wb, wsCases, 'Processos');

  const fileName = `relatorio-produtividade-${format(config.startDate, 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
