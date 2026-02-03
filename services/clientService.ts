
import { Client, ClientType } from '../types';
import { logAction } from '../utils/auditLogger.ts';

const STORAGE_KEY = 'legaltech_clients';

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    await new Promise(r => setTimeout(r, 300));
    return data ? JSON.parse(data) : [];
  },

  getClient: async (id: string): Promise<Client | null> => {
    const clients = await clientService.getClients();
    return clients.find(c => c.id === id) || null;
  },

  createClient: async (data: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'process_count'>): Promise<Client> => {
    const clients = await clientService.getClients();
    const newClient: Client = {
      ...data,
      id: crypto.randomUUID(),
      process_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    clients.push(newClient);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    
    logAction({
      action: 'create',
      entity_type: 'client',
      entity_id: newClient.id,
      entity_description: `Novo cliente cadastrado: ${newClient.name}`,
      details: { data: newClient },
      criticality: 'normal'
    });

    await new Promise(r => setTimeout(r, 500));
    return newClient;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    const clients = await clientService.getClients();
    const index = clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Cliente não encontrado');
    
    const before = { ...clients[index] };
    clients[index] = { 
      ...clients[index], 
      ...data, 
      updated_at: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));

    logAction({
      action: 'update',
      entity_type: 'client',
      entity_id: id,
      entity_description: `Dados do cliente atualizados: ${clients[index].name}`,
      details: { before, after: clients[index] },
      criticality: 'normal'
    });

    await new Promise(r => setTimeout(r, 500));
    return clients[index];
  },

  deleteClient: async (id: string): Promise<void> => {
    const clients = await clientService.getClients();
    const clientToDelete = clients.find(c => c.id === id);
    const filtered = clients.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    logAction({
      action: 'delete',
      entity_type: 'client',
      entity_id: id,
      entity_description: `Cliente removido do sistema: ${clientToDelete?.name || id}`,
      details: { deleted_data: clientToDelete },
      criticality: 'crítico'
    });

    await new Promise(r => setTimeout(r, 500));
  }
};
