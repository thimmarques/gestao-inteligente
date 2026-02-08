import { supabase } from '../lib/supabase';
import { ScheduleEvent } from '../types';

export const googleCalendarService = {
  createEvent: async (event: ScheduleEvent): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke('google-calendar', {
      method: 'POST',
      body: { ...event, userId: session?.user?.id },
    });

    if (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }

    return data.id;
  },

  updateEvent: async (
    googleEventId: string,
    data: Partial<ScheduleEvent>
  ): Promise<void> => {
    console.warn(
      'Update Google Event not fully supported in Edge Function yet, skipping.'
    );
  },

  deleteEvent: async (googleEventId: string): Promise<void> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.functions.invoke('google-calendar', {
      method: 'DELETE',
      headers: {
        'x-event-id': googleEventId,
        'x-user-id': session?.user?.id || '',
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
      method: 'GET',
      headers: {
        'x-user-id': session?.user?.id || '',
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
