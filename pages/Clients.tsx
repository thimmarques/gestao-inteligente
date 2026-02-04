
import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Search, Filter, RefreshCw,
  Loader2, MoreHorizontal, Mail, Phone, ExternalLink
} from 'lucide-react';
import { useClients } from '../hooks/useQueries';
import { clientService } from '../services/clientService';
import { Client } from '../types';
import { formatPhone } from '../utils/formatters';
import { CreateClientModal } from '../components/clients/CreateClientModal';
import { useApp } from '../contexts/AppContext';

const Clients: React.FC = () => {
  const { lawyer } = useApp();
  const { data: clients = [], isLoading, refetch } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cpf_cnpj.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'todos' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [clients, searchTerm, filterType]);

  const handleSaveClient = async (data: any) => {
    if (!lawyer) return;

    try {
      if (editingClient) {
        await clientService.updateClient(editingClient.id, data);
      } else {
        await clientService.createClient({
          ...data,
          office_id: lawyer.office_id
        });
      }
      refetch();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente.');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400">Total de {clients.length} clientes cadastrados.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <UserPlus size={20} /> Novo Cliente
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'particular', 'defensoria'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterType === t ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando clientes...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 font-black text-xl shadow-inner group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  {client.name[0]}
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${client.type === 'particular' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'}`}>
                  {client.type}
                </span>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white truncate" title={client.name}>{client.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{client.cpf_cnpj}</p>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={14} className="text-slate-400" />
                  <span>{formatPhone(client.phone)}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Editar Perfil
                </button>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium font-serif italic text-lg">Nenhum cliente encontrado.</p>
        </div>
      )}

      {isModalOpen && (
        <CreateClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveClient}
          initialData={editingClient}
          mode={editingClient ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

export default Clients;
