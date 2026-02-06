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
      console.error('Edge Function Error:', error);
      // Try to extract the error message from the response body if available
      if (error instanceof Error && 'context' in error) {
        // @ts-ignore
        const body = await error.context.json().catch(() => ({}));
        if (body.error) {
          throw new Error(body.error); // Use the friendlier error message from the backend
        }
      }
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
