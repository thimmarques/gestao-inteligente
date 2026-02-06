import { supabase } from '../lib/supabase';
import { Role } from '../types';

export interface Invite {
  id: string;
  office_id: string;
  email: string;
  role: Role;
  token: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export const inviteService = {
  // Admin/Lawyer: Create an invite (Calls Edge Function)
  async createInvite(email: string, role: string) {
    // 1. Validate Session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Você precisa estar logado para enviar convites.');
    }

    // 2. Invoke Function (Automatically passes Authorization header via supabase-js)
    const { data, error } = await supabase.functions.invoke(
      'send-invite-email',
      {
        body: { email, role },
      }
    );

    if (error) {
      // supabase-js functions.invoke returns error if network fails or non-2xx status
      // We try to extract more info if available
      throw error;
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },

  // Admin: List invites
  async listInvites() {
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Invite[];
  },

  // Public: Accept invite (Calls Edge Function)
  async acceptInvite(token: string, password: string, fullName: string) {
    const { data, error } = await supabase.functions.invoke('accept-invite', {
      body: { token, password, full_name: fullName },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data;
  },
};
