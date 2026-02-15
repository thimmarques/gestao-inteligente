export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'permission_change'
  | 'export'
  | 'access_denied'
  | 'system';
export type AuditEntityType =
  | 'case'
  | 'client'
  | 'deadline'
  | 'schedule'
  | 'finance'
  | 'team'
  | 'settings'
  | 'system';
export type Criticality = 'normal' | 'importante' | 'crítico';

export interface AuditLog {
  id: string;
  created_at: string;
  timestamp?: string; // Compatibilidade com componentes legados
  lawyer_id: string;
  lawyer_name: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_description: string;
  details?: string; // JSON string contendo { before, after }
  ip_address: string;
  user_agent: string;
  criticality: Criticality;
}
