import { ScheduleEvent } from '../types.ts';
import { supabase } from '../lib/supabase';
import { logAction } from '../utils/auditLogger.ts';
import { googleCalendarService } from './googleCalendarService.ts';

export const scheduleService = {
  getSchedules: async (): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from('schedules')
      .select(
        '*, case_details:case_id(process_number), client_details:client_id(name)'
      )
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getSchedule: async (id: string): Promise<ScheduleEvent | null> => {
    const { data, error } = await supabase
      .from('schedules')
      .select(
        '*, case_details:case_id(process_number), client_details:client_id(name)'
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createSchedule: async (
    data: Omit<ScheduleEvent, 'id' | 'created_at'>
  ): Promise<ScheduleEvent> => {
    const { data: newSchedule, error } = await supabase
      .from('schedules')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    // Sync to Google
    try {
      const googleEventId =
        await googleCalendarService.createEvent(newSchedule);
      if (googleEventId) {
        await supabase
          .from('schedules')
          .update({ google_event_id: googleEventId })
          .eq('id', newSchedule.id);
      }
    } catch (err) {
      console.error('Failed to sync new event to Google:', err);
    }

    await logAction({
      action: 'create',
      entity_type: 'schedule',
      entity_id: newSchedule.id,
      entity_description: `Novo compromisso agendado: ${newSchedule.title}`,
      details: { start_time: newSchedule.start_time },
      criticality: 'normal',
    });

    return newSchedule;
  },

  updateSchedule: async (
    id: string,
    data: Partial<ScheduleEvent>
  ): Promise<ScheduleEvent> => {
    const { data: updatedSchedule, error } = await supabase
      .from('schedules')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: 'update',
      entity_type: 'schedule',
      entity_id: id,
      entity_description: `Compromisso atualizado: ${updatedSchedule.title}`,
      details: { after: updatedSchedule },
      criticality: 'normal',
    });

    return updatedSchedule;
  },

  deleteSchedule: async (id: string): Promise<void> => {
    const { data: schedule } = await supabase
      .from('schedules')
      .select('title, google_event_id')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('schedules').delete().eq('id', id);

    if (error) throw error;

    // Sync deletion to Google
    if (schedule?.google_event_id) {
      try {
        await googleCalendarService.deleteEvent(schedule.google_event_id);
      } catch (err) {
        console.error('Failed to delete event from Google:', err);
      }
    }

    await logAction({
      action: 'delete',
      entity_type: 'schedule',
      entity_id: id,
      entity_description: `Compromisso removido: ${schedule?.title || 'ID ' + id}`,
      criticality: 'importante',
    });
  },

  getSchedulesByCase: async (caseId: string): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from('schedules')
      .select(
        '*, case_details:case_id(process_number), client_details:client_id(name)'
      )
      .eq('case_id', caseId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
