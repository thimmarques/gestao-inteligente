
import { ScheduleEvent } from '../types.ts';

const STORAGE_KEY = 'legaltech_schedules';

export const scheduleService = {
  getSchedules: async (): Promise<ScheduleEvent[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    await new Promise(r => setTimeout(r, 300)); // Simula latência
    return data ? JSON.parse(data) : [];
  },

  getSchedule: async (id: string): Promise<ScheduleEvent | null> => {
    const schedules = await scheduleService.getSchedules();
    return schedules.find(s => s.id === id) || null;
  },

  createSchedule: async (data: Omit<ScheduleEvent, 'id' | 'created_at'>): Promise<ScheduleEvent> => {
    const schedules = await scheduleService.getSchedules();

    const newSchedule: ScheduleEvent = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    schedules.push(newSchedule);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));

    await new Promise(r => setTimeout(r, 500));
    return newSchedule;
  },

  updateSchedule: async (id: string, data: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
    const schedules = await scheduleService.getSchedules();
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Evento não encontrado');

    schedules[index] = { ...schedules[index], ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));

    await new Promise(r => setTimeout(r, 500));
    return schedules[index];
  },

  deleteSchedule: async (id: string): Promise<void> => {
    const schedules = await scheduleService.getSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    await new Promise(r => setTimeout(r, 500));
  },

  getSchedulesByCase: async (caseId: string): Promise<ScheduleEvent[]> => {
    const schedules = await scheduleService.getSchedules();
    return schedules.filter(s => s.case_id === caseId);
  }
};
