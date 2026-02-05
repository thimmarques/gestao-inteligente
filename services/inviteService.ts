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
  // Admin/Lawyer: Create an invite
  async createInvite(email: string, role: string) {
    // Generate a simple random token for MVP (in production, use crypto.randomUUID)
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // We use the 'invites' table directly via RLS
    // Note: get_auth_office_id() in database handles the office assignment validation via RLS policy
    // But we need to pass office_id if we want to be explicit, OR let the RLS/Trigger handle it.
    // However, our policy says "Admins can manage office invites WHERE office_id = get_auth_office_id()".
    // So we must Insert with the correct office_id.

    // First, let's get the current user's office_id from profiles (client side or assume checking)
    // For safety, we can query it first or rely on the fact that RLS 'WITH CHECK' might fail if we guess wrong.
    // A better approach for the MVP is: fetch profile first.

    // Actually, simpler: Let the user provide it from their context, or fetch it here.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario nao autenticado');

    console.log('[DEBUG] createInvite - User:', user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('office_id, role, name')
      .eq('id', user.id)
      .single();

    console.log('[DEBUG] createInvite - Profile:', profile);
    console.log('[DEBUG] createInvite - Profile Error:', profileError);

    if (profileError || !profile?.office_id) {
      console.error('[DEBUG] Missing Office ID. User metadata:', user.user_metadata);
      throw new Error(`Usuario sem escritorio (ID: ${user.id}). Detalhes no console.`);
    }

    const { data, error } = await supabase
      .from('invites')
      .insert({
        office_id: profile.office_id,
        email,
        role,
        token,
        created_by: user.id,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
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
      body: { token, password, full_name: fullName }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data;
  }
};
