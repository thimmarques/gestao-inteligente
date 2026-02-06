import { Deadline, DeadlineFilters, DeadlineSort } from '../types';
import { getDeadlineStatus } from './deadlineCalculations';

export function filterDeadlines(
  deadlines: Deadline[],
  filters: DeadlineFilters
): Deadline[] {
  let filtered = [...deadlines];

  // Busca por texto
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(term) ||
        d.case?.process_number.includes(term) ||
        d.case?.client.name.toLowerCase().includes(term)
    );
  }

  // Status visual (calculado)
  if (filters.statusVisual.length > 0) {
    filtered = filtered.filter((d) => {
      const { status } = getDeadlineStatus(d);
      return filters.statusVisual.includes(status);
    });
  }

  // Prioridade (campo fixo)
  if (filters.priority.length > 0) {
    filtered = filtered.filter((d) => filters.priority.includes(d.priority));
  }

  // Processo específico
  if (filters.caseId && filters.caseId !== 'todos') {
    filtered = filtered.filter((d) => d.case_id === filters.caseId);
  }

  // Advogado específico
  if (filters.lawyerId && filters.lawyerId !== 'todos') {
    filtered = filtered.filter((d) => d.lawyer_id === filters.lawyerId);
  }

  // Faixa de data
  if (filters.dateRange) {
    filtered = filtered.filter((d) => {
      const date = new Date(d.deadline_date);
      return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
    });
  }

  return filtered;
}

export function sortDeadlines(
  deadlines: Deadline[],
  sort: DeadlineSort
): Deadline[] {
  const sorted = [...deadlines];

  sorted.sort((a, b) => {
    let comparison = 0;

    if (sort.field === 'deadline_date') {
      comparison =
        new Date(a.deadline_date).getTime() -
        new Date(b.deadline_date).getTime();
    } else if (sort.field === 'priority') {
      const priorityOrder: Record<string, number> = {
        urgente: 0,
        alta: 1,
        média: 2,
        baixa: 3,
      };
      comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sort.field === 'process') {
      comparison = (a.case?.process_number || '').localeCompare(
        b.case?.process_number || ''
      );
    } else if (sort.field === 'client') {
      comparison = (a.case?.client.name || '').localeCompare(
        b.case?.client.name || ''
      );
    } else if (sort.field === 'status') {
      const statusOrder: Record<string, number> = {
        vencido: 0,
        pendente: 1,
        concluído: 2,
      };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    }

    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
