export type TeamRole =
  | 'admin'
  | 'lawyer'
  | 'assistant'
  | 'intern'
  | 'advogado'
  | 'assistente';

export interface Invite {
  id: string;
  email: string;
  role: TeamRole;
  status: 'pending' | 'sent' | 'accepted' | 'revoked';
  created_at: string;
  office_id: string;
  created_by: string;
}

export interface TeamMemberPermissions {
  can_create_cases: boolean;
  can_edit_cases: boolean;
  can_delete_cases: boolean;
  can_manage_finance: boolean;
  can_manage_team: boolean;
  can_view_all_cases: boolean;
}

export interface TeamMemberStats {
  active_cases: number;
  completed_cases: number;
  pending_deadlines: number;
  success_rate: number;
}

export interface TeamMemberSocial {
  linkedin_url?: string;
  instagram_handle?: string;
}

export interface TeamMember {
  id: string;
  office_id: string;
  name: string;
  email: string;
  role: TeamRole;
  oab?: string;
  phone: string;
  photo_url?: string;
  status: 'ativo' | 'inativo';
  specialty?: string;
  bio?: string;
  permissions: TeamMemberPermissions;
  stats?: TeamMemberStats;
  social?: TeamMemberSocial;
  created_at: string;
  updated_at: string;
  last_login?: string;
}
