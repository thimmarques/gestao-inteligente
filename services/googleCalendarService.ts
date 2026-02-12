import { supabase } from '../lib/supabase';
import { ScheduleEvent } from '../types';

export const googleCalendarService = {
  createEvent: async (event: ScheduleEvent): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke('google-calendar', {
      body: {
        action: 'create',
        userId: session?.user?.id,
        title: event.title,
        description: event.description || '',
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || undefined,
      },
    });

    if (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }

    return data?.id || null;
  },

  updateEvent: async (
    _googleEventId: string,
    _data: Partial<ScheduleEvent>
  ): Promise<void> => {
    console.warn('Update Google Event not fully supported yet, skipping.');
  },

  deleteEvent: async (googleEventId: string): Promise<void> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.functions.invoke('google-calendar', {
      body: {
        action: 'delete',
        userId: session?.user?.id,
        eventId: googleEventId,
      },
    });

    if (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  },

  listEvents: async (startDate: Date, endDate: Date): Promise<any[]> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke('google-calendar', {
      body: {
        action: 'list',
        userId: session?.user?.id,
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
      },
    });

    if (error) {
      console.error('Error listing Google Calendar events:', error);
      return [];
    }

    return data?.items || [];
  },

  getUserId: async (): Promise<string | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.user?.id || null;
  },
};
