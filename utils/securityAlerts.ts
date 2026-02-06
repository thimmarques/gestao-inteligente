import { AuditLog } from '../types/audit';
import { subHours, getHours, format } from 'date-fns';

export interface SecurityAlert {
  id: string;
  type: 'warning' | 'info' | 'danger';
  severity: 'baixa' | 'média' | 'alta';
  title: string;
  message: string;
  timestamp: string;
  action_required: string;
  related_logs?: string[];
  reviewed?: boolean;
}

export function checkSecurityAlerts(logs: AuditLog[]): SecurityAlert[] {
  const alerts: SecurityAlert[] = [];
  const last24h = subHours(new Date(), 24);
  const recentLogs = logs.filter((l) => new Date(l.timestamp) >= last24h);

  // ALERTA 1: Múltiplas deleções por mesmo usuário (5+ em 24h)
  const deletions = recentLogs.filter((l) => l.action === 'delete');
  const deletionsByUser: Record<string, AuditLog[]> = {};
  deletions.forEach((l) => {
    if (!deletionsByUser[l.lawyer_id]) deletionsByUser[l.lawyer_id] = [];
    deletionsByUser[l.lawyer_id].push(l);
  });

  Object.entries(deletionsByUser).forEach(([lawyerId, userDeletions]) => {
    if (userDeletions.length >= 5) {
      alerts.push({
        id: `alert-del-${lawyerId}`,
        type: 'warning',
        severity: 'alta',
        title: 'Múltiplas Deleções Detectadas',
        message: `${userDeletions[0].lawyer_name} deletou ${userDeletions.length} registros nas últimas 24h.`,
        timestamp: new Date().toISOString(),
        action_required: 'Revisar atividade do usuário e snapshots de backup.',
        related_logs: userDeletions.map((d) => d.id),
      });
    }
  });

  // ALERTA 2: Mudanças de permissão fora do horário comercial (20h-07h)
  const perms = recentLogs.filter((l) => l.action === 'permission_change');
  perms.forEach((log) => {
    const hour = getHours(new Date(log.timestamp));
    if (hour < 8 || hour > 19) {
      alerts.push({
        id: `alert-perm-${log.id}`,
        type: 'danger',
        severity: 'alta',
        title: 'Alteração de Acesso Noturna',
        message: `Privilégios de sistema foram alterados por ${log.lawyer_name} às ${format(new Date(log.timestamp), 'HH:mm')}.`,
        timestamp: log.timestamp,
        action_required: 'Confirmar legitimidade da alteração administrativa.',
        related_logs: [log.id],
      });
    }
  });

  // ALERTA 3: Acessos Negados Repetidos
  const denied = recentLogs.filter((l) => l.action === 'access_denied');
  if (denied.length >= 5) {
    alerts.push({
      id: 'alert-denied-bulk',
      type: 'warning',
      severity: 'média',
      title: 'Tentativas de Acesso Negadas',
      message: `${denied.length} tentativas de acesso não autorizado bloqueadas nas últimas 24h.`,
      timestamp: new Date().toISOString(),
      action_required:
        'Verificar se há tentativas de escalonamento de privilégios.',
    });
  }

  return alerts;
}
