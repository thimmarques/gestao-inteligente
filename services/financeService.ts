
import { FinanceRecord } from '../types.ts';

const STORAGE_KEY = 'legaltech_finances';

export const financeService = {
  getFinances: async (): Promise<FinanceRecord[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    await new Promise(r => setTimeout(r, 200));
    
    if (!data) return [];
    
    const finances = JSON.parse(data);
    const clients = JSON.parse(localStorage.getItem('legaltech_clients') || '[]');
    const cases = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
    
    return finances.map((f: any) => ({
      ...f,
      client: f.client_id ? clients.find((c: any) => c.id === f.client_id) : null,
      case: f.case_id ? cases.find((c: any) => c.id === f.case_id) : null
    }));
  },

  getRevenues: async (): Promise<FinanceRecord[]> => {
    const finances = await financeService.getFinances();
    return finances.filter(f => f.type === 'receita');
  },

  getExpenses: async (): Promise<FinanceRecord[]> => {
    const finances = await financeService.getFinances();
    return finances.filter(f => f.type === 'despesa');
  },

  createRecord: async (data: Omit<FinanceRecord, 'id' | 'created_at'>): Promise<FinanceRecord> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const records = raw ? JSON.parse(raw) : [];
    
    const newRecord = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    
    records.push(newRecord);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    await new Promise(r => setTimeout(r, 400));
    return newRecord as unknown as FinanceRecord;
  },

  updateRecord: async (id: string, data: Partial<FinanceRecord>): Promise<FinanceRecord> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const records = raw ? JSON.parse(raw) : [];
    const index = records.findIndex((r: any) => r.id === id);
    
    if (index === -1) throw new Error('Registro não encontrado');
    
    // Remove UI-only injected fields
    const { client, case: _, ...pureData } = data as any;
    
    records[index] = { ...records[index], ...pureData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    await new Promise(r => setTimeout(r, 400));
    return records[index];
  },

  deleteRecord: async (id: string): Promise<void> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const records = raw ? JSON.parse(raw) : [];
    const filtered = records.filter((r: any) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    await new Promise(r => setTimeout(r, 400));
  },

  getFinancesByCase: async (caseId: string): Promise<FinanceRecord[]> => {
    const finances = await financeService.getFinances();
    return finances.filter(f => f.case_id === caseId);
  }
};
