
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Deadline } from '../types';
import { ReportConfig } from './generateFinancialReportPDF';

export async function generateDeadlinesReportExcel(
  config: ReportConfig,
  deadlines: Deadline[]
) {
  const wb = XLSX.utils.book_new();

  const data = deadlines.map(d => ({
    'Título': d.title,
    'Processo': d.case?.process_number || 'N/A',
    'Cliente': d.case?.client.name || 'N/A',
    'Vencimento': format(new Date(d.deadline_date), 'dd/MM/yyyy'),
    'Prioridade': d.priority,
    'Status': d.status,
    'Concluído em': d.completed_at ? format(new Date(d.completed_at), 'dd/MM/yyyy') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Prazos Judiciais');

  const fileName = `relatorio-prazos-${format(config.startDate, 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}
