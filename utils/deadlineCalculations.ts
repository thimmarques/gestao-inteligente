
import { differenceInDays, startOfDay } from 'date-fns';
import { Deadline } from '../types';

export function calculateDaysRemaining(deadlineDate: string): number {
  const today = startOfDay(new Date());
  const deadline = startOfDay(new Date(deadlineDate));
  return differenceInDays(deadline, today);
}

export function getDeadlineStatus(deadline: Deadline): {
  status: 'ok' | 'proximo' | 'urgente' | 'hoje' | 'vencido' | 'concluido';
  color: string;
  text: string;
} {
  if (deadline.status === 'concluído') {
    return { status: 'concluido', color: '#22c55e', text: 'Concluído' };
  }
  
  const days = calculateDaysRemaining(deadline.deadline_date);
  
  if (days < 0) {
    return { status: 'vencido', color: '#6b7280', text: `Vencido há ${Math.abs(days)} dias` };
  }
  if (days === 0) {
    return { status: 'hoje', color: '#ef4444', text: 'VENCE HOJE' };
  }
  if (days <= 2) {
    return { status: 'urgente', color: '#ef4444', text: `Faltam ${days} dias` };
  }
  if (days <= 7) {
    return { status: 'proximo', color: '#eab308', text: `Faltam ${days} dias` };
  }
  
  return { status: 'ok', color: '#22c55e', text: `Faltam ${days} dias` };
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'baixa': '#6b7280',
    'média': '#3b82f6',
    'alta': '#f97316',
    'urgente': '#ef4444'
  };
  return colors[priority] || '#6b7280';
}
