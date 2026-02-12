import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  MoreHorizontal,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { useClients } from '../hooks/useQueries';
import { clientService } from '../services/clientService';
import { caseService } from '../services/caseService';
import { Client } from '../types';
import { formatPhone } from '../utils/formatters';
import { CreateClientModal } from '../components/clients/CreateClientModal';
import { ClientDetailsModal } from '../components/clients/ClientDetailsModal';
import { CaseDetailsModal } from '../components/cases/CaseDetailsModal';
import { CaseFormModal } from '../components/cases/CaseFormModal';
import { useAuth } from '../contexts/AuthContext';

const Clients: React.FC = () => {
  const { user: lawyer } = useAuth();
  const { data: clients = [], isLoading, refetch } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientDetailsOpen, setClientDetailsOpen] = useState(false);
  const [selectedClientDetails, setSelectedClientDetails] =
    useState<Client | null>(null);
  const [caseDetailsOpen, setCaseDetailsOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Case Creation State
  const [isCaseFormOpen, setIsCaseFormOpen] = useState(false);
  const [preSelectedClientId, setPreSelectedClientId] = useState<string | null>(
    null
  );

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cpf_cnpj.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'todos' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [clients, searchTerm, filterType]);

  const handleSaveClient = async (formData: any) => {
    if (!lawyer) return;

    try {
      // 1. Extrair e formatar dados extras para o campo notes
      const {
        address,
        rg,
        rg_issuer,
        profession,
        income,
        nationality,
        marital_status,
        process,
        ...clientData
      } = formData;

      const addressString = address
        ? `\n\nENDEREÇO:\n${address.street || ''}, ${address.number || ''} - ${address.neighborhood || ''}\n${address.city || ''} - ${address.state || ''}\nCEP: ${address.cep || ''}`
        : '';

      const personalInfoString = `\n\nDADOS PESSOAIS:\nRG: ${rg || '-'} (${rg_issuer || '-'})\nProfissão: ${profession || '-'}\nRenda: ${income || '-'}\nNacionalidade: ${nationality || '-'}\nEstado Civil: ${marital_status || '-'}`;

      const finalNotes =
        (clientData.notes || '') + personalInfoString + addressString;

      const cleanClientData = {
        ...clientData,
        notes: finalNotes,
        office_id: lawyer.office_id,
      };

      let savedClient: Client;

      if (editingClient) {
        // Remove office_id from update if present to avoid RLS issues or unwanted changes
        // identifying fields to update
        const { office_id, ...updateData } = cleanClientData;
        savedClient = await clientService.updateClient(
          editingClient.id,
          updateData
        );
      } else {
        savedClient = await clientService.createClient(cleanClientData);

        // 2. Se houver processo, criar o caso relacionado
        if (process && process.number) {
          try {
            // Import CaseStatus dynamically or use string 'andamento' if matched with DB constraint
            // Importing caseService at the top of file is needed.
            // Using logic here assuming caseService is available.
            await caseService.createCase({
              client_id: savedClient.id,
              lawyer_id: lawyer.id,
              office_id: lawyer.office_id,
              process_number: process.number,
              court: 'Tribunal de Justiça', // Default
              type: process.legal_area || 'cível',
              status: 'andamento' as any, // Cast to any or CaseStatus.ANDAMENTO
              value: clientData.financial_profile?.valor_honorarios
                ? parseFloat(clientData.financial_profile.valor_honorarios)
                : 0,
              started_at: new Date().toISOString(),
              notes: process.description || '',
              tags: [],
            });
          } catch (caseError) {
            console.error('Erro ao criar processo automático:', caseError);
            // Non-blocking error for client creation
            alert(
              'Cliente salvo, mas houve um erro ao criar o processo automaticamente.'
            );
          }
        }
      }

      refetch();
      setIsModalOpen(false); // Close modal on success
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar cliente: ' + (err as Error).message);
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

  const handleOpenClientDetails = (client: Client) => {
    setSelectedClientDetails(client);
    setClientDetailsOpen(true);
  };

  const handleOpenCaseDetails = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCaseDetailsOpen(true);
  };

  const handleCreateCase = (clientId: string) => {
    setPreSelectedClientId(clientId);
    setIsCaseFormOpen(true);
  };

  const handleSaveCase = async (data: any) => {
    if (!lawyer) return;

    try {
      await caseService.createCase({
        ...data,
        office_id: lawyer.office_id,
        lawyer_id: lawyer.id,
      });
      setIsCaseFormOpen(false);
      setPreSelectedClientId(null);
      // Optional: Refetch clients if needed, or if case count updates
      refetch();
      alert('Processo criado com sucesso!');
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Erro ao criar processo.');
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Clientes</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Total de {clients.length} clientes cadastrados.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <UserPlus size={20} /> Novo Cliente
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-navy-800/50 p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-navy-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'particular', 'defensoria'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filterType === t ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 dark:bg-navy-800 text-slate-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Carregando clientes...
          </p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-navy-800/50 p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-primary-600 font-black text-xl shadow-inner group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                  {client.name[0]}
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${client.type === 'particular' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30'}`}
                >
                  {client.type}
                </span>
              </div>

              <h3
                className="font-bold text-slate-800 dark:text-white truncate"
                title={client.name}
              >
                {client.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{client.cpf_cnpj}</p>

              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50 dark:border-white/10">
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
                  onClick={() => handleOpenClientDetails(client)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> Ver Detalhes
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 bg-slate-100 dark:bg-navy-800 hover:bg-primary-600 hover:text-white text-slate-400 hover:border-primary-600 transition-all rounded-xl"
                  title="Editar"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-navy-800/50 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium font-serif italic text-lg">
            Nenhum cliente encontrado.
          </p>
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

      {clientDetailsOpen && selectedClientDetails && (
        <ClientDetailsModal
          client={selectedClientDetails}
          isOpen={clientDetailsOpen}
          onClose={() => setClientDetailsOpen(false)}
          onEdit={(client) => {
            setClientDetailsOpen(false);
            handleEdit(client);
          }}
          onViewCase={handleOpenCaseDetails}
          onCreateCase={handleCreateCase}
        />
      )}

      {caseDetailsOpen && selectedCaseId && (
        <CaseDetailsModal
          caseId={selectedCaseId}
          isOpen={caseDetailsOpen}
          onClose={() => setCaseDetailsOpen(false)}
        />
      )}

      {isCaseFormOpen && (
        <CaseFormModal
          isOpen={isCaseFormOpen}
          onClose={() => {
            setIsCaseFormOpen(false);
            setPreSelectedClientId(null);
          }}
          onSave={handleSaveCase}
          initialData={
            preSelectedClientId ? { client_id: preSelectedClientId } : undefined
          }
        />
      )}
    </div>
  );
};

export default Clients;
