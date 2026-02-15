import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { getOffice } from './settingsPersistence';
import { AuditLog } from '../types/audit';
import { Case } from '../types';

const COLORS = {
  header: [15, 23, 42] as [number, number, number],
  accent: [249, 115, 22] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
};

export async function generateCaseHistoryPDF(
  caseData: Case & { client?: { name: string } },
  activities: AuditLog[]
): Promise<string> {
  const doc = new jsPDF();
  const office = getOffice();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cabeçalho Profissional
  doc.setFillColor(COLORS.header[0], COLORS.header[1], COLORS.header[2]);
  doc.rect(0, 0, pageWidth, 35, 'F');

  if (office.logo_url) {
    try {
      doc.addImage(office.logo_url, 'PNG', 15, 8, 30, 15);
    } catch (e) {}
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(office.name.toUpperCase(), pageWidth - 15, 18, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('RELAÇÃO DE MOVIMENTAÇÕES PROCESSUAIS', pageWidth - 15, 24, {
    align: 'right',
  });

  doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
  doc.rect(0, 35, pageWidth, 1.2, 'F');

  // Dados do Processo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Histórico do Processo', 15, 55);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);
  doc.text(
    [
      `Processo: ${caseData.process_number}`,
      `Cliente: ${caseData.client?.name || 'Não informado'}`,
      `Data de Emissão: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
    ],
    15,
    65
  );

  // Tabela de Movimentações
  const tableData = activities.map((activity) => [
    format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm'),
    activity.lawyer_name || 'Usuário',
    activity.entity_description,
  ]);

  autoTable(doc, {
    head: [['DATA/HORA', 'USUÁRIO', 'DESCRIÇÃO DA MOVIMENTAÇÃO']],
    body: tableData,
    startY: 85,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: {
      fillColor: COLORS.header,
      fontSize: 9,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
    },
  });

  // Rodapé
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2]);

    // Linha divisória rodapé
    doc.setDrawColor(226, 232, 240);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

    doc.text(office.address || '', 15, pageHeight - 12);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 15, pageHeight - 12, {
      align: 'right',
    });
  }

  const fileName = `historico_${caseData.process_number.replace(/\//g, '-')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
  return fileName;
}
