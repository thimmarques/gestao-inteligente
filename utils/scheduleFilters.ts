
import { ScheduleEvent } from '../types';

export interface ScheduleFilters {
  types: string[]; // ['audiência', 'reunião']
  status: string[]; // ['agendado', 'concluído']
  clients: string[]; // array de client_ids
  lawyers: string[]; // array de lawyer_ids (multi-advogado)
  showOnlyMine: boolean;
}

export function filterSchedules(
  schedules: ScheduleEvent[],
  filters: ScheduleFilters,
  currentLawyerId: string
): ScheduleEvent[] {
  let filtered = [...schedules];

  // Filtro por Tipo
  if (filters.types.length > 0) {
    filtered = filtered.filter(s => filters.types.includes(s.type));
  }

  // Filtro por Status
  if (filters.status.length > 0) {
    filtered = filtered.filter(s => filters.status.includes(s.status));
  }

  // Filtro por Clientes
  if (filters.clients.length > 0) {
    filtered = filtered.filter(s => 
      s.client_id && filters.clients.includes(s.client_id)
    );
  }

  // Filtro por Advogados
  if (filters.lawyers.length > 0) {
    filtered = filtered.filter(s => filters.lawyers.includes(s.lawyer_id));
  }

  // Apenas meus eventos
  if (filters.showOnlyMine) {
    filtered = filtered.filter(s => s.lawyer_id === currentLawyerId);
  }

  return filtered;
}
