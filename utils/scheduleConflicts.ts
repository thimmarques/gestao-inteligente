import { ScheduleEvent } from "../types";

export function checkScheduleConflict(
  newEvent: { start: Date; end: Date; lawyer_id: string },
  existingEvents: ScheduleEvent[],
): ScheduleEvent | null {
  // Filtrar eventos do mesmo advogado que não estejam cancelados
  const lawyerEvents = existingEvents.filter(
    (e) => e.lawyer_id === newEvent.lawyer_id && e.status !== "cancelado",
  );

  // Verificar sobreposição
  for (const event of lawyerEvents) {
    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    const hasOverlap =
      (newEvent.start >= eventStart && newEvent.start < eventEnd) ||
      (newEvent.end > eventStart && newEvent.end <= eventEnd) ||
      (newEvent.start <= eventStart && newEvent.end >= eventEnd);

    if (hasOverlap) {
      return event; // Retorna o primeiro evento conflitante encontrado
    }
  }

  return null; // Sem conflito
}
