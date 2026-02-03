
import { Client } from '../types';

export interface ClientFilters {
  search: string;
  status: 'todos' | 'ativo' | 'inativo';
  type: 'todos' | 'particular' | 'defensoria';
  sortBy: 'name' | 'created_at';
  sortDirection: 'asc' | 'desc';
}

export function filterClients(
  clients: Client[],
  filters: ClientFilters
): Client[] {
  let filtered = [...clients];

  // Search
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(term) || 
      c.cpf_cnpj.includes(term) || 
      c.email?.toLowerCase().includes(term)
    );
  }

  // Status
  if (filters.status !== 'todos') {
    filtered = filtered.filter(c => c.status === filters.status);
  }

  // Type
  if (filters.type !== 'todos') {
    filtered = filtered.filter(c => c.type === filters.type);
  }

  // Sort
  filtered.sort((a, b) => {
    const field = filters.sortBy;
    const direction = filters.sortDirection === 'asc' ? 1 : -1;

    if (field === 'name') {
      return a.name.localeCompare(b.name) * direction;
    }
    if (field === 'created_at') {
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * direction;
    }
    return 0;
  });

  return filtered;
}
