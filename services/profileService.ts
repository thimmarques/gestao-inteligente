import { supabase } from '../lib/supabase';
import { Lawyer } from '../types';

export const profileService = {
  getProfile: async (id: string): Promise<Lawyer | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  updateProfile: async (
    id: string,
    updates: Partial<Lawyer>
  ): Promise<Lawyer> => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
