
import { TeamRole } from '../types/team.ts';

export interface PendingInvite {
  id: string;
  email: string;
  role: TeamRole;
  sender_name: string;
  status: 'pending' | 'accepted' | 'expired';
  sent_at: string;
  expires_at: string;
}

export const inviteService = {
  sendInvite: async (email: string, role: TeamRole, senderName: string): Promise<void> => {
    // Simular latência de SMTP
    await new Promise(r => setTimeout(r, 2000));
    
    const invites: PendingInvite[] = JSON.parse(localStorage.getItem('legaltech_invites') || '[]');
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const invite: PendingInvite = {
      id: crypto.randomUUID(),
      email,
      role,
      sender_name: senderName,
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: expiryDate.toISOString()
    };
    
    invites.push(invite);
    localStorage.setItem('legaltech_invites', JSON.stringify(invites));
    
    console.log(`[SIMULAÇÃO] Email enviado para ${email} com link: https://legaltech.com/invite/${invite.id}`);
  },
  
  getPendingInvites: async (): Promise<PendingInvite[]> => {
    const invites = JSON.parse(localStorage.getItem('legaltech_invites') || '[]');
    return invites.filter((i: PendingInvite) => i.status === 'pending');
  },

  cancelInvite: async (id: string): Promise<void> => {
    const invites: PendingInvite[] = JSON.parse(localStorage.getItem('legaltech_invites') || '[]');
    const updated = invites.filter(i => i.id !== id);
    localStorage.setItem('legaltech_invites', JSON.stringify(updated));
  }
};
