
import { ScheduleEvent } from '../types.ts';
import { supabase } from '../lib/supabase';
import { logAction } from '../utils/auditLogger.ts';

export const scheduleService = {
  getSchedules: async (): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getSchedule: async (id: string): Promise<ScheduleEvent | null> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createSchedule: async (data: Omit<ScheduleEvent, 'id' | 'created_at'>): Promise<ScheduleEvent> => {
    const { data: newSchedule, error } = await supabase
      .from('schedules')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    await logAction({
      action: 'create',
      entity_type: 'schedule',
      entity_id: newSchedule.id,
      entity_description: `Novo compromisso agendado: ${newSchedule.title}`,
      details: { start_time: newSchedule.start_time },
      criticality: 'normal'
    });

    return newSchedule;
  },

  updateSchedule: async (id: string, data: Partial<ScheduleEvent>): Promise<ScheduleEvent> => {
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
      criticality: 'normal'
    });

    return updatedSchedule;
  },

  deleteSchedule: async (id: string): Promise<void> => {
    const { data: schedule } = await supabase.from('schedules').select('title').eq('id', id).single();

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logAction({
      action: 'delete',
      entity_type: 'schedule',
      entity_id: id,
      entity_description: `Compromisso removido: ${schedule?.title || 'ID ' + id}`,
      criticality: 'importante'
    });
  },

  getSchedulesByCase: async (caseId: string): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('case_id', caseId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  }
};
