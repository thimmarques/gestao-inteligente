import {
  AuditLog,
  AuditAction,
  AuditEntityType,
  Criticality,
} from '../types/audit.ts';
import { supabase } from '../lib/supabase';

interface LogActionParams {
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_description: string;
  details?: any;
  criticality?: Criticality;
  office_id?: string;
  lawyer_id?: string;
  lawyer_name?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
  // If params don't include user info, we try to get it from auth
  let { office_id, lawyer_id, lawyer_name } = params;

  if (!office_id || !lawyer_id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn('AuditLog: No user logged in for action', params.action);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('office_id, name')
      .eq('id', user.id)
      .single();

    if (profile) {
      office_id = profile.office_id;
      lawyer_id = user.id;
      lawyer_name = profile.name;
    }
  }

  if (!office_id || !lawyer_id) return;

  let criticality = params.criticality;
  if (!criticality) {
    if (
      params.action === 'delete' ||
      params.action === 'permission_change' ||
      params.action === 'access_denied'
    ) {
      criticality = 'crítico';
    } else if (
      params.action === 'update' &&
      ['finance', 'team', 'settings'].includes(params.entity_type)
    ) {
      criticality = 'importante';
    } else {
      criticality = 'normal';
    }
  }

  const { error } = await supabase.from('audit_logs').insert({
    office_id,
    lawyer_id,
    lawyer_name: lawyer_name || 'Usuário',
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    entity_description: params.entity_description,
    details: params.details,
    ip_address: '0.0.0.0', // Would need backend or edge function for real IP
    user_agent: navigator.userAgent,
    criticality,
  });

  if (error) {
    console.error('Error saving audit log:', error);
  }
}

export async function getAuditLogs(officeId: string): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('office_id', officeId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export async function getCriticalLogsCount24h(
  officeId: string
): Promise<number> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('office_id', officeId)
    .eq('criticality', 'crítico')
    .gt('created_at', yesterday);

  if (error) throw error;
  return count || 0;
}

export function getDeviceInfo(ua: string): string {
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac OS')) return 'Apple Mac';
  if (ua.includes('Android')) return 'Android Phone';
  if (ua.includes('iPhone')) return 'Apple iPhone';
  if (ua.includes('iPad')) return 'Apple iPad';
  return 'Web Browser';
}
