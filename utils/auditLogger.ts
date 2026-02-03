
import { AuditLog, AuditAction, AuditEntityType, Criticality } from '../types/audit.ts';
import { getCurrentLawyer, getPreferences } from './settingsPersistence.ts';
import { subHours, isAfter, subDays } from 'date-fns';

interface LogActionParams {
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_description: string;
  details?: any;
  criticality?: Criticality;
}

const LOG_STORAGE_KEY = 'legaltech_audit_logs';

export function logAction(params: LogActionParams): void {
  const currentUser = getCurrentLawyer();
  
  if (!currentUser) {
    console.error('Tentativa de log sem usuário autenticado');
    return;
  }
  
  const rawLogs = localStorage.getItem(LOG_STORAGE_KEY);
  const logs: AuditLog[] = rawLogs ? JSON.parse(rawLogs) : [];
  
  let criticality = params.criticality;
  if (!criticality) {
    if (params.action === 'delete' || params.action === 'permission_change' || params.action === 'access_denied') {
      criticality = 'crítico';
    } else if (params.action === 'update' && ['finance', 'team', 'settings'].includes(params.entity_type)) {
      criticality = 'importante';
    } else {
      criticality = 'normal';
    }
  }
  
  const log: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    lawyer_id: currentUser.id,
    lawyer_name: currentUser.name,
    action: params.action,
    entity_type: params.entity_type,
    entity_id: params.entity_id,
    entity_description: params.entity_description,
    details: params.details ? JSON.stringify(params.details) : undefined,
    ip_address: '127.0.0.1', // Mock
    user_agent: navigator.userAgent,
    criticality
  };
  
  logs.unshift(log);
  
  // Limpeza automática baseada em retenção (default 90 dias)
  const preferences = getPreferences();
  const retentionDays = (preferences as any).log_retention_days || 90;
  const cutoffDate = subDays(new Date(), retentionDays);
  
  const kept = logs.filter(l => new Date(l.timestamp) >= cutoffDate);
  if (kept.length > 10000) kept.length = 10000;
  
  localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(kept));
}

export function cleanupOldLogs(retentionDays: number = 90): number {
  const rawLogs = localStorage.getItem(LOG_STORAGE_KEY);
  if (!rawLogs) return 0;
  const logs: AuditLog[] = JSON.parse(rawLogs);
  const cutoffDate = subDays(new Date(), retentionDays);
  const kept = logs.filter(l => new Date(l.timestamp) >= cutoffDate);
  const removed = logs.length - kept.length;
  if (removed > 0) {
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(kept));
    logAction({
      action: 'system',
      entity_type: 'settings',
      entity_id: 'audit_logs',
      entity_description: `Limpeza programada: ${removed} logs antigos removidos`,
      criticality: 'importante'
    });
  }
  return removed;
}

export function getCriticalLogsCount24h(): number {
  const rawLogs = localStorage.getItem(LOG_STORAGE_KEY);
  if (!rawLogs) return 0;
  const logs: AuditLog[] = JSON.parse(rawLogs);
  const last24h = subHours(new Date(), 24);
  return logs.filter(l => l.criticality === 'crítico' && isAfter(new Date(l.timestamp), last24h)).length;
}

export function getDeviceInfo(ua: string): string {
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac OS')) return 'Apple Mac';
  if (ua.includes('Android')) return 'Android Phone';
  if (ua.includes('iPhone')) return 'Apple iPhone';
  if (ua.includes('iPad')) return 'Apple iPad';
  return 'Web Browser';
}
