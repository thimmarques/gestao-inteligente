
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'permission_change' | 'export' | 'access_denied' | 'system';
export type AuditEntityType = 'case' | 'client' | 'deadline' | 'schedule' | 'finance' | 'team' | 'settings' | 'system';
export type Criticality = 'normal' | 'importante' | 'crítico';

export interface AuditLog {
  id: string;
  timestamp: string;
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
