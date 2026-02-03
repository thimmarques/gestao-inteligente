
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { FinanceRecord } from '../types';
import { formatCurrency } from './formatters';
import { getOffice } from './settingsPersistence';

export interface ReportConfig {
  startDate: Date;
  endDate: Date;
  includeRevenues: boolean;
  includeExpenses: boolean;
  includeCharts: boolean;
  includeSummary: boolean;
  includeOverdue: boolean;
  format: 'pdf' | 'excel';
}

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

  // Cabeçalho Estilo Procuração
  doc.setFillColor(COLORS.header[0], COLORS.header[1], COLORS.header[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  if (office.logo_url) {
    try { doc.addImage(office.logo_url, 'PNG', 15, 8, 30, 15); } catch (e) { }
  } else {
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('L', 15, 22);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(office.name.toUpperCase(), pageWidth - 15, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(title.toUpperCase(), pageWidth - 15, 24, { align: 'right' });

  // Linha Laranja de Acento
  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 35, pageWidth, 1.2, 'F');

  // Rodapé Institucional
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
    doc.text(office.address || '', pageWidth / 2, pageHeight - 15, { align: 'center' });
    doc.text(`Página ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    doc.text(`Emitido: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, pageHeight - 10);
  }
};

export async function generateFinancialReportPDF(
  config: ReportConfig,
  revenues: FinanceRecord[],
  expenses: FinanceRecord[],
  kpis: any
): Promise<string> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Financeiro Estratégico', 15, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período analisado: ${format(config.startDate, 'dd/MM/yyyy')} a ${format(config.endDate, 'dd/MM/yyyy')}`, 15, 70);

  autoTable(doc, {
    startY: 85,
    head: [['Indicador', 'Valor']],
    body: [
      ['Total de Receitas', formatCurrency(kpis.totalRev)],
      ['Total de Despesas', formatCurrency(kpis.totalExp)],
      ['Saldo Líquido', formatCurrency(kpis.balance)],
      ['Receita Recorrente', formatCurrency(kpis.mrr)],
      ['Ticket Médio', formatCurrency(kpis.avgTicket)]
    ],
    theme: 'striped',
    headStyles: { fillColor: COLORS.header },
    styles: { fontSize: 10, cellPadding: 5 }
  });

  if (config.includeRevenues && revenues.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento de Entradas', 15, 50);

    autoTable(doc, {
      startY: 55,
      head: [['Data', 'Cliente', 'Categoria', 'Valor', 'Status']],
      body: revenues.map(r => [
        format(new Date(r.due_date), 'dd/MM/yy'),
        r.client?.name || '---',
        r.category,
        formatCurrency(r.amount),
        r.status.toUpperCase()
      ]),
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 8 }
    });
  }

  applyProfessionalLayout(doc, 'Controle Financeiro');

  const fileName = `financeiro_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`;
  doc.save(fileName);
  return fileName;
}
