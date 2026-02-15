import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  LayoutGrid,
  Table2,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Client, ClientType } from '../types';
import { clientService } from '../services/clientService';
import { caseService } from '../services/caseService';
import { financeService } from '../services/financeService';
import { seedClients } from '../utils/seedClients';
import { filterClients, ClientFilters } from '../utils/clientFilters';
import { ClientFiltersBar } from '../components/clients/ClientFilters';
import { ClientTable } from '../components/clients/ClientTable';
import { ClientCard } from '../components/clients/ClientCard';
import { CreateClientModal } from '../components/clients/CreateClientModal';
import { ClientDetailsModal } from '../components/clients/ClientDetailsModal';
import { CaseDetailsModal } from '../components/cases/CaseDetailsModal';
import { CreateCaseModal } from '../components/cases/CreateCaseModal';
import {
  formatCPF,
  formatPhone,
  formatDate,
  formatCurrency,
  parseCurrency,
} from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const Clients: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    return (localStorage.getItem('clients_view') as any) || 'table';
  });
  const [selectedTab, setSelectedTab] = useState<
    'todos' | 'particulares' | 'defensoria'
  >('todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingCaseId, setViewingCaseId] = useState<string | null>(null);
  const [isAddingCaseOpen, setIsAddingCaseOpen] = useState(false);
  const [addingCaseForClientId, setAddingCaseForClientId] = useState<
    string | null
  >(null);

  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    status: 'todos',
    type: 'todos',
    sortBy: 'name',
    sortDirection: 'asc',
  });

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clientService.getClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    seedClients();
    loadClients();
  }, [loadClients]);

  const handleFilterChange = (newFilters: Partial<ClientFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const filteredClients = useMemo(() => {
    let result = filterClients(clients, filters);

    if (selectedTab === 'particulares') {
      result = result.filter((c) => c.type === ClientType.PARTICULAR);
    } else if (selectedTab === 'defensoria') {
      result = result.filter((c) => c.type === ClientType.DEFENSORIA);
    }

    return result;
  }, [clients, filters, selectedTab]);

  const handleExport = async () => {
    if (filteredClients.length === 0) {
      alert('Nenhum cliente para exportar nesta visualização.');
      return;
    }

    const allFinances = await financeService.getFinances();

    const dataToExport = filteredClients.map((client) => {
      const clientFinances = allFinances.filter(
        (f) => f.client_id === client.id
      );
      const totalPaid = clientFinances
        .filter((f) => f.status === 'pago')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const totalPending = clientFinances
        .filter((f) => f.status !== 'pago')
        .reduce((acc, curr) => acc + curr.amount, 0);
      const isOverdue = clientFinances.some((f) => f.status === 'vencido');

      // Use safe navigation or 'any' cast if properties are dynamic/not in standard type
      const addr = (client as any).address || {};
      const fp = client.financial_profile || {};
      const process = (client as any).process || {};

      return {
        'Nome Completo': client.name,
        'Tipo de Contrato':
          client.type === ClientType.PARTICULAR ? 'Particular' : 'Defensoria',
        'CPF/CNPJ': formatCPF(client.cpf_cnpj),
        RG: (client as any).rg || '-',
        'Emissor RG': (client as any).rg_issuer || '-',
        'E-mail': client.email || '-',
        Telefone: formatPhone(client.phone),
        Nacionalidade: (client as any).nationality || 'Brasileira',
        'Estado Civil': (client as any).marital_status || '-',
        Profissão: (client as any).profession || '-',
        'Renda Declarada': (client as any).income
          ? `R$ ${parseFloat((client as any).income).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '-',
        Logradouro: addr.street || '-',
        Nº: addr.number || '-',
        Bairro: addr.neighborhood || '-',
        Cidade: addr.city || '-',
        Estado: addr.state || '-',
        CEP: addr.cep || '-',
        'Processo Principal': fp.process_number || process.number || '-',
        'Área Jurídica': process.legal_area || fp.process_type || '-',
        'Comarca/Foro': fp.comarca || '-',
        'Data de Nomeação (Defensoria)': fp.appointment_date
          ? formatDate(fp.appointment_date)
          : '-',
        'Método de Pagamento Preferencial': fp.payment_method || '-',
        'Honorários Firmados (Particular)': fp.honorarios_firmados
          ? `R$ ${parseFloat(fp.honorarios_firmados as any).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '-',
        'Possui Entrada?': fp.tem_entrada ? 'SIM' : 'NÃO',
        'Valor da Entrada': fp.valor_entrada
          ? `R$ ${parseFloat(fp.valor_entrada as any).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          : '-',
        'Data da Entrada': fp.data_entrada ? formatDate(fp.data_entrada) : '-',
        'Qtd Parcelas Restantes': fp.num_parcelas_restante || '-',
        'VALOR TOTAL PAGO': `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        'SALDO TOTAL PENDENTE': `R$ ${totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        'STATUS FINANCEIRO': isOverdue
          ? 'INADIMPLENTE'
          : totalPending > 0
            ? 'EM DIA (A RECEBER)'
            : 'QUITADO',
        'Status do Cadastro': client.status.toUpperCase(),
        'Data de Cadastro no Sistema': formatDate(client.created_at),
        'Notas do Advogado': client.notes || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Base de Dados Clientes');
    const tabName = selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1);
    const fileName = `LegalTech_Relatorio_${tabName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // syncClientFinances moved to financeService.syncClientFinances

  const handleSaveClient = async (data: any) => {
    try {
      // Filtrar apenas campos que existem no banco de dados para evitar erro 400 (PGRST204)
      const sanitizedData = {
        name: data.name,
        type: data.type,
        cpf_cnpj: data.cpf_cnpj,
        email: data.email,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
        financial_profile: data.financial_profile,
        office_id: user?.office_id, // Dynamic ID from AuthContext
      };

      if (!user?.office_id) {
        alert('Erro: Usuário não autenticado ou sem escritório vinculado.');
        return;
      }

      if (editingClient) {
        await clientService.updateClient(editingClient.id, sanitizedData);
        // Sync finances on update
        await financeService.syncClientFinances(
          editingClient.id,
          data,
          user.id,
          user.office_id
        );
      } else {
        const newClient = await clientService.createClient(sanitizedData);
        let newCaseId = '';
        if (data.process?.number) {
          try {
            const newCase = await caseService.createCase({
              client_id: newClient.id,
              lawyer_id: user.id,
              office_id: user.office_id,
              process_number: data.process.number,
              court: data.financial_profile?.comarca || 'Não informada',
              type: data.process.legal_area || 'cível',
              status: 'andamento' as any,
              value: data.financial_profile?.valor_honorarios
                ? parseCurrency(
                    data.financial_profile.valor_honorarios.toString()
                  )
                : 0,
              started_at:
                data.financial_profile?.appointment_date ||
                new Date().toISOString(),
              notes: data.process.description || '',
              tags: [data.type],
            });
            newCaseId = newCase.id;
          } catch (e) {
            console.error('Error auto-creating case:', e);
          }
        }
        // Sync finances on creation
        await financeService.syncClientFinances(
          newClient.id,
          data,
          user.id,
          user.office_id,
          newCaseId
        );
      }
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      loadClients();
      setIsCreateModalOpen(false); // Make sure to close modal
      setEditingClient(null);
    } catch (error: any) {
      console.error('Full Error Object:', error);
      // Extrair mensagem detalhada do Supabase se disponível
      const detailMessage =
        error.message || error.details || JSON.stringify(error);
      alert(`Erro ao salvar dados integrados: ${detailMessage}`);
    }
  };

  // Safe navigation for selected client
  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  return (
    <div className="p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            <span>Escritório</span>
            <ChevronRight size={12} />
            <span className="text-primary-600">Base de Clientes</span>
          </div>
          <h1 className="text-3xl font-black dark:text-white tracking-tight">
            Clientes
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gestão com automação financeira imediata.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-bold shadow-xl transition-all active:scale-95 group"
        >
          <UserPlus
            size={20}
            className="group-hover:rotate-12 transition-transform"
          />
          Novo Cliente
        </button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {['todos', 'particulares', 'defensoria'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedTab === tab
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => {
                setViewMode('table');
                localStorage.setItem('clients_view', 'table');
              }}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
            >
              <Table2 size={20} />
            </button>
            <button
              onClick={() => {
                setViewMode('cards');
                localStorage.setItem('clients_view', 'cards');
              }}
              className={`p-2 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-slate-100 dark:bg-slate-800 text-primary-600' : 'text-slate-400'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <ClientFiltersBar
          onFilterChange={handleFilterChange}
          onExport={handleExport}
        />
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 size={40} className="text-primary-500 animate-spin mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">
              Carregando...
            </p>
          </div>
        ) : filteredClients.length > 0 ? (
          viewMode === 'table' ? (
            <ClientTable
              clients={filteredClients}
              onRowClick={(id) => setSelectedClientId(id)}
              onEdit={(c) => {
                setEditingClient(c);
                setIsCreateModalOpen(true);
              }}
              onDelete={async (c) => {
                if (confirm('Excluir?')) {
                  await clientService.deleteClient(c.id);
                  queryClient.invalidateQueries({ queryKey: ['clients'] });
                  loadClients();
                }
              }}
              onToggleStatus={async (c) => {
                await clientService.updateClient(c.id, {
                  status: c.status === 'ativo' ? 'inativo' : 'ativo',
                });
                loadClients();
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClientId(client.id)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
            <UserPlus size={40} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-bold dark:text-white">
              Nenhum cliente
            </h3>
          </div>
        )}
      </div>

      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveClient}
        initialData={editingClient}
        mode={editingClient ? 'edit' : 'create'}
      />
      <ClientDetailsModal
        isOpen={!!selectedClientId && !isCreateModalOpen}
        onClose={() => setSelectedClientId(null)}
        client={selectedClient}
        onEdit={(c) => {
          setSelectedClientId(null);
          setEditingClient(c);
          setIsCreateModalOpen(true);
        }}
        onViewCase={(caseId) => setViewingCaseId(caseId)}
        onCreateCase={(clientId) => {
          setAddingCaseForClientId(clientId);
          setIsAddingCaseOpen(true);
        }}
      />

      <CaseDetailsModal
        isOpen={!!viewingCaseId}
        onClose={() => setViewingCaseId(null)}
        caseId={viewingCaseId}
      />

      <CreateCaseModal
        isOpen={isAddingCaseOpen}
        onClose={() => {
          setIsAddingCaseOpen(false);
          setAddingCaseForClientId(null);
        }}
        initialClientId={addingCaseForClientId || undefined}
        onSaveSuccess={(clientId) => {
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          queryClient.invalidateQueries({ queryKey: ['cases'] });
          queryClient.invalidateQueries({ queryKey: ['cases', 'client', clientId] });
          loadClients();
        }}
      />
    </div>
  );
};

export default Clients;
