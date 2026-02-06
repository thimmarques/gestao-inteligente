import { supabase } from '../lib/supabase';

export interface Task {
  id: string;
  office_id: string;
  lawyer_id: string;
  case_id?: string | null;
  title: string;
  description?: string;
  status: 'pendente' | 'em_andamento' | 'concluído';
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  createTask: async (
    data: Omit<Task, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Task> => {
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newTask;
  },

  updateTask: async (id: string, data: Partial<Task>): Promise<Task> => {
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedTask;
  },

  deleteTask: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) throw error;
  },
};
