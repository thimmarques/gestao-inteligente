
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isWithinInterval } from 'date-fns';
import { Case, ScheduleEvent, Deadline } from '../types';
import { ReportConfig } from './generateFinancialReportPDF';
import { getOffice } from './settingsPersistence';

const COLORS = {
  header: [15, 23, 42] as [number, number, number],
  accent: [249, 115, 22] as [number, number, number],
  text: [30, 41, 59] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number]
};

const applyProfessionalLayout = (doc: jsPDF, title: string) => {
  const office = getOffice();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFillColor(COLORS.header[0], COLORS.header[1], COLORS.header[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  if (office.logo_url) {
    try { doc.addImage(office.logo_url, 'PNG', 15, 8, 30, 15); } catch (e) { }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(office.name.toUpperCase(), pageWidth - 15, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), pageWidth - 15, 24, { align: 'right' });

  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 35, pageWidth, 1.2, 'F');

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(office.address || '', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(`Página ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
};

export async function generateProductivityReportPDF(
  config: ReportConfig,
  cases: Case[],
  schedules: ScheduleEvent[],
  deadlines: Deadline[]
): Promise<string> {
  const doc = new jsPDF();

  const periodCases = cases.filter(c => isWithinInterval(new Date(c.started_at), { start: config.startDate, end: config.endDate }));
  const periodDeadlines = deadlines.filter(d => isWithinInterval(new Date(d.deadline_date), { start: config.startDate, end: config.endDate }));

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Fluxo e Produtividade', 15, 60);

  autoTable(doc, {
    startY: 80,
    head: [['Métrica Analítica', 'Total']],
    body: [
      ['Abertura de Processos', periodCases.length],
      ['Atos e Compromissos', schedules.length],
      ['Prazos Concluídos', periodDeadlines.filter(d => d.status === 'concluído').length],
      ['Taxa de Compliance', `${((periodDeadlines.filter(d => d.status === 'concluído').length / (periodDeadlines.length || 1)) * 100).toFixed(1)}%`]
    ],
    theme: 'grid',
    headStyles: { fillColor: COLORS.header },
    styles: { cellPadding: 5 }
  });

  applyProfessionalLayout(doc, 'Gestão de Produtividade');

  const fileName = `produtividade_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
  return fileName;
}
