import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { Client, FinanceRecord } from '../types';
import { ReportConfig } from './generateFinancialReportPDF';

export async function generateClientsReportExcel(
  config: ReportConfig,
  clients: Client[],
  finances: FinanceRecord[]
) {
  const wb = XLSX.utils.book_new();

  // SHEET 1: RESUMO
  const summaryData = [
    ['Relatório Estratégico de Clientes'],
    [
      `Período: ${format(config.startDate, 'dd/MM/yyyy')} a ${format(config.endDate, 'dd/MM/yyyy')}`,
    ],
    [`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
    [],
    ['INDICADORES GERAIS'],
    ['Total de Clientes', clients.length],
    [
      'Clientes Particulares',
      clients.filter((c) => c.type === 'particular').length,
    ],
    [
      'Clientes Defensoria',
      clients.filter((c) => c.type === 'defensoria').length,
    ],
    ['Clientes Ativos', clients.filter((c) => c.status === 'ativo').length],
    ['Clientes Inativos', clients.filter((c) => c.status === 'inativo').length],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Executivo');

  // SHEET 2: LISTA DE CLIENTES
  const clientsData = clients.map((c) => {
    const clientRevenues = finances.filter(
      (f) => f.client_id === c.id && f.type === 'receita' && f.status === 'pago'
    );
    const totalRevenue = clientRevenues.reduce((sum, f) => sum + f.amount, 0);

    return {
      Nome: c.name,
      'CPF/CNPJ': c.cpf_cnpj,
      Tipo: c.type === 'particular' ? 'Particular' : 'Defensoria',
      Status: c.status === 'ativo' ? 'Ativo' : 'Inativo',
      Email: c.email || '-',
      Telefone: c.phone,
      'Receita Total (Pago)': totalRevenue,
      'Data de Cadastro': format(new Date(c.created_at), 'dd/MM/yyyy'),
    };
  });

  const wsClients = XLSX.utils.json_to_sheet(clientsData);
  wsClients['!cols'] = [
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, wsClients, 'Base de Clientes');

  // DOWNLOAD
  const fileName = `relatorio-clientes-${format(config.startDate, 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return fileName;
}
