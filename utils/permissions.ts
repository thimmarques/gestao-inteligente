import { Lawyer, Role } from '../types';
import { TeamMemberPermissions } from '../types/team';
import { logAction } from './auditLogger';

const DEFAULT_PERMISSIONS: Record<string, TeamMemberPermissions> = {
  [Role.ADMIN]: {
    can_create_cases: true,
    can_edit_cases: true,
    can_delete_cases: true,
    can_manage_finance: true,
    can_manage_team: true,
    can_view_all_cases: true,
  },
  [Role.LAWYER]: {
    can_create_cases: true,
    can_edit_cases: true,
    can_delete_cases: false,
    can_manage_finance: true,
    can_manage_team: false,
    can_view_all_cases: false,
  },
  [Role.ASSISTANT]: {
    can_create_cases: false,
    can_edit_cases: false,
    can_delete_cases: false,
    can_manage_finance: false,
    can_manage_team: false,
    can_view_all_cases: true,
  },
};

export function checkPermission(
  user: Lawyer | null,
  permission: keyof TeamMemberPermissions
): boolean {
  if (!user) return false;
  if (user.role === Role.ADMIN) return true;
  const perms = DEFAULT_PERMISSIONS[user.role];
  return perms ? !!perms[permission] : false;
}

export function requirePermission(
  user: Lawyer | null,
  permission: keyof TeamMemberPermissions,
  actionLabel: string
): boolean {
  const allowed = checkPermission(user, permission);

  if (!allowed && user) {
    logAction({
      action: 'access_denied',
      entity_type: 'system',
      entity_id: 'security_policy',
      entity_description: `Tentativa de acesso negada: ${actionLabel}`,
      details: {
        required_permission: permission,
        user_role: user.role,
      },
      criticality: 'importante',
    });
  }

  return allowed;
}
