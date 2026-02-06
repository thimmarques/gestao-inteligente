import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Report } from '../types';

export function useReports() {
  return useQuery<Report[]>({
    queryKey: ['reports'],
    queryFn: async () => {
      const data = localStorage.getItem('legalflow_reports');
      await new Promise((r) => setTimeout(r, 200));
      return data ? JSON.parse(data) : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const raw = localStorage.getItem('legalflow_reports');
      if (!raw) return;
      const reports: Report[] = JSON.parse(raw);
      const filtered = reports.filter((r) => r.id !== reportId);
      localStorage.setItem('legalflow_reports', JSON.stringify(filtered));
      await new Promise((r) => setTimeout(r, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
