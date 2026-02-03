
import { Deadline } from '../types.ts';

const STORAGE_KEY = 'legaltech_deadlines';

export const deadlineService = {
  
  getDeadlines: async (): Promise<Deadline[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    await new Promise(r => setTimeout(r, 200)); // Latência simulada
    
    if (!data) return [];
    
    const deadlines = JSON.parse(data);
    
    // Join com cases e clients para display
    const cases = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
    const clients = JSON.parse(localStorage.getItem('legaltech_clients') || '[]');
    
    return deadlines.map((d: any) => {
      const relatedCase = cases.find((c: any) => c.id === d.case_id);
      const relatedClient = relatedCase ? clients.find((cl: any) => cl.id === relatedCase.client_id) : null;
      
      return {
        ...d,
        case: relatedCase ? {
          process_number: relatedCase.process_number,
          client: relatedClient ? { name: relatedClient.name } : { name: 'Cliente N/A' }
        } : null
      };
    });
  },
  
  getDeadline: async (id: string): Promise<Deadline | null> => {
    const deadlines = await deadlineService.getDeadlines();
    return deadlines.find(d => d.id === id) || null;
  },
  
  createDeadline: async (data: Omit<Deadline, 'id' | 'created_at' | 'case'>): Promise<Deadline> => {
    const deadlines = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const newDeadline = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    
    deadlines.push(newDeadline);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
    
    await new Promise(r => setTimeout(r, 400));
    return newDeadline as unknown as Deadline;
  },
  
  updateDeadline: async (id: string, data: Partial<Deadline>): Promise<Deadline> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deadlines = raw ? JSON.parse(raw) : [];
    const index = deadlines.findIndex((d: any) => d.id === id);
    
    if (index === -1) throw new Error('Prazo não encontrado');
    
    // Removemos o objeto 'case' injetado antes de salvar de volta no localStorage
    const { case: _, ...pureData } = data;
    
    deadlines[index] = { ...deadlines[index], ...pureData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deadlines));
    
    await new Promise(r => setTimeout(r, 400));
    return deadlines[index];
  },
  
  deleteDeadline: async (id: string): Promise<void> => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const deadlines = raw ? JSON.parse(raw) : [];
    const filtered = deadlines.filter((d: any) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    await new Promise(r => setTimeout(r, 400));
  }
};
