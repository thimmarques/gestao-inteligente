
import { Case, CaseWithRelations, Client } from '../types';
import { logAction } from '../utils/auditLogger.ts';

const STORAGE_KEY = 'legaltech_cases';

export const caseService = {
  getCases: async (): Promise<CaseWithRelations[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cases: Case[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const clients: Client[] = JSON.parse(localStorage.getItem('legaltech_clients') || '[]');
    
    return cases.map(c => ({
      ...c,
      client: clients.find(cl => cl.id === c.client_id),
      deadlines_count: 0,
      urgent_deadlines_count: 0,
      schedules_count: 0,
      finances_balance: 0
    })) as CaseWithRelations[];
  },

  getCaseById: async (id: string): Promise<CaseWithRelations | null> => {
    const cases = await caseService.getCases();
    return cases.find(c => c.id === id) || null;
  },

  createCase: async (data: Omit<Case, 'id' | 'created_at' | 'updated_at'>): Promise<Case> => {
    const cases = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newCase: Case = {
      ...data,
      id: 'case-' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    cases.push(newCase);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));

    logAction({
      action: 'create',
      entity_type: 'case',
      entity_id: newCase.id,
      entity_description: `Novo processo aberto: ${newCase.process_number}`,
      details: { data: newCase },
      criticality: 'normal'
    });

    return newCase;
  },

  updateCase: async (id: string, data: Partial<Case>): Promise<Case> => {
    const cases: Case[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Processo não encontrado');
    
    const before = { ...cases[index] };
    cases[index] = { ...cases[index], ...data, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));

    logAction({
      action: 'update',
      entity_type: 'case',
      entity_id: id,
      entity_description: `Processo atualizado: ${cases[index].process_number}`,
      details: { before, after: cases[index] },
      criticality: 'normal'
    });

    return cases[index];
  },

  deleteCase: async (id: string): Promise<void> => {
    const cases: Case[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const caseToDelete = cases.find(c => c.id === id);
    const filtered = cases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    logAction({
      action: 'delete',
      entity_type: 'case',
      entity_id: id,
      entity_description: `Processo excluído definitivamente: ${caseToDelete?.process_number || id}`,
      details: { deleted_data: caseToDelete },
      criticality: 'crítico'
    });
  },

  seedInitialData: () => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};
