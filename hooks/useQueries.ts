import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { clientService } from '../services/clientService';
import { caseService } from '../services/caseService';
import { deadlineService } from '../services/deadlineService';
import { financeService } from '../services/financeService';
import { scheduleService } from '../services/scheduleService';
import { taskService } from '../services/taskService';
import { notificationService } from '../services/notificationService';

export const useClients = (options?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) => {
  return useQuery({
    queryKey: ['clients', options],
    queryFn: () => clientService.getClients(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useCases = (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  client_id?: string;
}) => {
  return useQuery({
    queryKey: ['cases', options],
    queryFn: () => caseService.getCases(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
};

export const useCase = (id: string | null) => {
  return useQuery({
    queryKey: ['case', id],
    queryFn: () => (id ? caseService.getCaseById(id) : null),
    enabled: !!id,
  });
};

export const useDeadlines = () => {
  return useQuery({
    queryKey: ['deadlines'],
    queryFn: () => deadlineService.getDeadlines(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useDeadlinesByCase = (caseId: string) => {
  return useQuery({
    queryKey: ['deadlines', 'case', caseId],
    queryFn: () => deadlineService.getDeadlinesByCase(caseId),
    enabled: !!caseId,
  });
};

export const useFinances = () => {
  return useQuery({
    queryKey: ['finances'],
    queryFn: () => financeService.getFinances(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFinancesByCase = (caseId: string) => {
  return useQuery({
    queryKey: ['finances', 'case', caseId],
    queryFn: () => financeService.getFinancesByCase(caseId),
    enabled: !!caseId,
  });
};

export const useSchedules = () => {
  return useQuery({
    queryKey: ['schedules'],
    queryFn: () => scheduleService.getSchedules(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSchedulesByCase = (caseId: string) => {
  return useQuery({
    queryKey: ['schedules', 'case', caseId],
    queryFn: () => scheduleService.getSchedulesByCase(caseId),
    enabled: !!caseId,
  });
};

export const useTasks = () => {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });
};

export const useTeam = () => {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useAuditLogs = (officeId?: string) => {
  return useQuery({
    queryKey: ['audit_logs', officeId],
    queryFn: async () => {
      if (!officeId) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('office_id', officeId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!officeId,
  });
};

export const useAuditLogsByEntity = (entityId: string | null) => {
  return useQuery({
    queryKey: ['audit_logs', 'entity', entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!entityId,
  });
};
