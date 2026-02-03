
import { FinanceRecord, Case, ScheduleEvent, Deadline } from '../types';
import { formatCurrency } from './formatters';

export function generateFinancialInsights(
  revenues: FinanceRecord[],
  expenses: FinanceRecord[],
  kpis: any
): string[] {
  const insights: string[] = [];
  
  // Saldo
  if (kpis.balance > 0) {
    insights.push(`✓ Saldo positivo de ${formatCurrency(kpis.balance)} no período. Fluxo de caixa saudável.`);
  } else if (kpis.balance < 0) {
    insights.push(`⚠ Saldo negativo de ${formatCurrency(Math.abs(kpis.balance))}. Recomenda-se revisão imediata de gastos variáveis.`);
  }
  
  // Maiores Movimentações
  if (revenues.length > 0) {
    const maxRev = [...revenues].sort((a, b) => b.amount - a.amount)[0];
    insights.push(`💰 Maior entrada: ${maxRev.category} (${formatCurrency(maxRev.amount)}) de ${maxRev.client?.name || 'Cliente N/A'}.`);
  }
  
  if (expenses.length > 0) {
    const maxExp = [...expenses].sort((a, b) => b.amount - a.amount)[0];
    insights.push(`💸 Maior despesa: ${maxExp.category} (${formatCurrency(maxExp.amount)}).`);
  }
  
  // Inadimplência
  if (kpis.defaultRate > 15) {
    insights.push(`⚠ Taxa de inadimplência crítica (${kpis.defaultRate.toFixed(1)}%). Necessário intensificar réguas de cobrança.`);
  } else if (kpis.defaultRate > 0 && kpis.defaultRate <= 5) {
    insights.push(`✓ Excelente controle de recebíveis. Inadimplência sob controle (${kpis.defaultRate.toFixed(1)}%).`);
  }
  
  // Recorrência
  if (kpis.mrr > 0) {
    insights.push(`📊 Receita Recorrente (MRR) consolidada em ${formatCurrency(kpis.mrr)}. Estabilidade operacional garantida.`);
  }
  
  return insights;
}

export function generateProductivityInsights(
  cases: Case[],
  schedules: ScheduleEvent[],
  deadlines: Deadline[]
): string[] {
  const insights: string[] = [];
  
  const totalCases = cases.length;
  const closedCases = cases.filter(c => c.status === 'encerrado' || c.status === 'arquivado').length;
  
  if (totalCases > 0) {
    const ratio = (closedCases / totalCases) * 100;
    if (ratio > 30) {
      insights.push(`✓ Alta taxa de vazão processual: ${ratio.toFixed(1)}% dos casos foram encerrados no período.`);
    }
  }

  // Êxito
  const concluded = cases.filter(c => c.outcome && c.outcome !== 'em_andamento');
  if (concluded.length > 0) {
    const wins = concluded.filter(c => c.outcome === 'ganho' || c.outcome === 'acordo').length;
    const rate = (wins / concluded.length) * 100;
    if (rate >= 75) {
      insights.push(`🏆 Desempenho jurídico excepcional: Taxa de êxito de ${rate.toFixed(1)}% nas decisões finais.`);
    } else if (rate < 50) {
      insights.push(`⚠ Taxa de êxito em ${rate.toFixed(1)}%. Recomenda-se análise crítica das teses aplicadas.`);
    }
  }
  
  // Prazos
  const totalDeadlines = deadlines.length;
  if (totalDeadlines > 0) {
    const done = deadlines.filter(d => d.status === 'concluído').length;
    const rate = (done / totalDeadlines) * 100;
    if (rate >= 95) {
      insights.push(`✓ Gestão de prazos impecável. ${rate.toFixed(1)}% de cumprimento rigoroso.`);
    } else if (rate < 80) {
      insights.push(`⚠ Alerta de compliance: ${totalDeadlines - done} prazos não foram finalizados ou estão em atraso.`);
    }
  }
  
  return insights;
}
