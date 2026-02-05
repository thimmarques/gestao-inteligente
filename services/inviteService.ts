import { TeamRole } from "../types/team.ts";
import { supabase } from "../lib/supabase";

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
  sender_id: string;
  office_id: string;
  status: "pending" | "accepted" | "expired" | "canceled";
  created_at: string;
  expires_at: string;
}

export const inviteService = {
  sendInvite: async (
    email: string,
    role: TeamRole,
    senderId: string,
    officeId: string,
  ): Promise<void> => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const { error } = await supabase.from("invites").insert({
      email,
      role,
      sender_id: senderId,
      office_id: officeId,
      status: "pending",
      expires_at: expiryDate.toISOString(),
    });

    if (error) throw error;

    // In a real app, this would trigger an Edge Function to send email
    console.log(`[SUPABASE] Convite registrado para ${email}`);
  },

  getPendingInvites: async (): Promise<PendingInvite[]> => {
    const { data, error } = await supabase
      .from("invites")
      .select("*")
      .eq("status", "pending");

    if (error) throw error;
    return data || [];
  },

  cancelInvite: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("invites")
      .update({ status: "canceled" })
      .eq("id", id);

    if (error) throw error;
  },
};
