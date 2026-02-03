
import { ScheduleEvent } from '../types';

export const googleCalendarService = {
  isConnected: (): boolean => {
    return !!localStorage.getItem('google_calendar_token');
  },

  createEvent: async (event: ScheduleEvent): Promise<string> => {
    await new Promise(r => setTimeout(r, 800));
    return 'google_id_' + Math.random().toString(36).substring(7);
  },

  updateEvent: async (googleEventId: string, data: Partial<ScheduleEvent>): Promise<void> => {
    await new Promise(r => setTimeout(r, 600));
  },

  deleteEvent: async (googleEventId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 500));
  },

  listEvents: async (startDate: Date, endDate: Date): Promise<any[]> => {
    await new Promise(r => setTimeout(r, 1200));
    return [];
  }
};
