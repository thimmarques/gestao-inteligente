import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Files,
  Copy,
  Clock,
  ArrowDownRight,
  ExternalLink,
  Shield,
  Trash2,
  FileText,
  Scale,
  CreditCard,
  HandCoins,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Client, ClientType } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
} from '../../utils/formatters';
import { clientService } from '../../services/clientService';
import { financeService } from '../../services/financeService';
import { useCases, useFinancesByClient } from '../../hooks/useQueries';

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onViewCase: (caseId: string) => void;
  onCreateCase: (clientId: string) => void;
  onClientUpdate?: (client: Client) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  isOpen,
  onClose,
  onEdit,
  onViewCase,
  onCreateCase,
  onClientUpdate,
}) => {
  const { user } = useAuth();
  const { data: cases = [], isLoading: isLoadingCases } = useCases({
    client_id: client?.id,
  });
  const { data: records = [], isLoading: isLoadingFinances } =
    useFinancesByClient(client?.id || '');
  const [activeTab, setActiveTab] = useState<
    'geral' | 'processos' | 'financeiro' | 'documentos'
  >('geral');

  // Calculate Financial Totals based on ACTUAL records
  const financial = client?.financial_profile || {};

  // Total contracted value should stay from profile or sum of all related revenue records
  const totalContractedVal = parseFloat(
    financial.honorarios_firmados || financial.valor_honorarios || '0'
  );

  // Filter revenue records
  const revenueRecords = records.filter((r) => r.type === 'receita');

  // Total Paid: Sum of ALL 'pago' revenue records
  const totalPaidCount = revenueRecords
    .filter((r) => r.status === 'pago')
    .reduce((acc, r) => acc + r.amount, 0);

  // Total Value (Sum of all planned revenues)
  const totalValueCalculated = revenueRecords.reduce(
    (acc, r) => acc + r.amount,
    0
  );

  // If we have records, we use their sum, otherwise fallback to profile value
  const displayTotalValue =
    totalValueCalculated > 0 ? totalValueCalculated : totalContractedVal;

  const remainingValue = Math.max(0, displayTotalValue - totalPaidCount);

  // Sort installments by due date
  const sortedRecords = [...revenueRecords].sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  // Identify entry record
  const entryRecord = sortedRecords.find(
    (r) =>
      r.category === 'Entrada de Honorários' ||
      r.title?.toLowerCase().includes('entrada')
  );

  const installmentsList = sortedRecords.filter(
    (r) =>
      r.id !== entryRecord?.id &&
      (r.category?.includes('Parcela') ||
        r.title?.toLowerCase().includes('parcela'))
  );

  if (!isOpen || !client) return null;

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      try {
        await clientService.deleteClient(client.id);
        onClose();
        // Force reload or invalidate queries would be better
        window.location.reload();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente.');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-navy-800/50 w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="p-10 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-white/10">
          <div className="flex gap-8">
            <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-primary-500/20 overflow-hidden">
              {client.photo_url ? (
                <img src={client.photo_url} alt="" />
              ) : (
                client.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold dark:text-white tracking-tight">
                  {client.name}
                </h2>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    client.status === 'ativo'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                    client.type === ClientType.PARTICULAR
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {client.type === ClientType.PARTICULAR ? (
                    <User size={10} />
                  ) : (
                    <Shield size={10} />
                  )}
                  {client.type}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Cadastrado em {formatDate(client.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onEdit(client)}
              className="p-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all active:scale-95 shadow-sm"
              title="Editar"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="p-3 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 shadow-sm"
              title="Excluir"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-10 border-b border-slate-100 dark:border-white/10 flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
          {[
            { id: 'geral', label: 'Dados Gerais', icon: <User size={16} /> },
            {
              id: 'processos',
              label: 'Processos',
              icon: <Briefcase size={16} />,
            },
            {
              id: 'financeiro',
              label: 'Financeiro',
              icon: <DollarSign size={16} />,
            },
            {
              id: 'documentos',
              label: 'Documentos',
              icon: <Files size={16} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-6 text-xs font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30 dark:bg-navy-950/20">
          <div className="max-w-4xl mx-auto h-full animate-in fade-in duration-500">
            {activeTab === 'geral' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-3 space-y-8">
                  {/* Contact Info Card */}
                  <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm space-y-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Informações de Contato
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      <div className="space-y-1 group">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          CPF/CNPJ
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm dark:text-white">
                            {formatCPF(client.cpf_cnpj)}
                          </p>
                          <button
                            onClick={() => copyToClipboard(client.cpf_cnpj)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-300 hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          E-mail
                        </p>
                        <a
                          href={`mailto:${client.email}`}
                          className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-2 truncate"
                        >
                          {client.email || 'Não informado'}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Telefone
                        </p>
                        <p className="text-sm font-bold dark:text-white">
                          {formatPhone(client.phone) || '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Cidade / Estado
                        </p>
                        <p className="text-sm font-medium dark:text-slate-300">
                          -, -
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Configuration Card */}
                  <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm space-y-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Configuração de Pagamento
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Forma de Pagamento
                        </p>
                        <div className="flex items-center gap-2">
                          <CreditCard size={18} className="text-primary-500" />
                          <p className="text-sm font-bold dark:text-white">
                            {client.financial_profile?.payment_method ||
                              'Cartão de Crédito'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Status de Entrada
                        </p>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-green-500" />
                          <div>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400 leading-none">
                              Entrada de{' '}
                              {formatCurrency(displayTotalValue * 0.1 || 1000)}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Recebida em {formatDate(client.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Dia de Faturamento
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-primary-500" />
                          <p className="text-sm font-bold dark:text-white">
                            Todo dia{' '}
                            {client.financial_profile?.billing_day || 13}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Honorários Contratados
                      </p>
                      <p className="text-2xl font-black dark:text-white">
                        {formatCurrency(displayTotalValue || 10000)}
                      </p>
                    </div>
                  </div>

                  {/* Notes & Active Processes Grid */}
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                        Notas e Observações
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "{client.notes || 'Nenhuma nota adicional.'}"
                      </p>
                    </div>

                    <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center gap-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-primary-600">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-3xl font-black dark:text-white">
                          {client.process_count}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Processos Ativos
                        </p>
                      </div>
                      <button
                        onClick={() => onCreateCase(client.id)}
                        className="mt-2 px-8 py-3 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                      >
                        Abrir Novo Processo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'processos' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Briefcase size={14} /> Processos Associados ({cases.length})
                </h3>
                {isLoadingCases ? (
                  <div className="py-12 text-center text-slate-400 text-sm">
                    Carregando processos...
                  </div>
                ) : cases.length > 0 ? (
                  <div className="grid gap-4">
                    {cases.map((process) => (
                      <div
                        key={process.id}
                        className="group bg-slate-50 dark:bg-navy-800/50 p-6 rounded-2xl border border-slate-100 dark:border-white/10 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => onViewCase(process.id)}
                      >
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600">
                          <ExternalLink size={16} />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold dark:text-white text-lg">
                                {process.process_number}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  process.status === 'distribuído' ||
                                  process.status === 'andamento'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
                                }`}
                              >
                                {process.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-2 truncate max-w-md">
                              {process.court} • {process.type}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock size={12} />
                                Criado em {formatDate(process.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                              Valor
                            </p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">
                              {process.value
                                ? formatCurrency(process.value)
                                : 'R$ 0,00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50 dark:bg-navy-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                    <Briefcase
                      size={40}
                      className="mx-auto text-slate-300 mb-4"
                    />
                    <p className="text-slate-500 font-medium">
                      Nenhum processo associado a este cliente.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Files size={14} /> Documentos Gerados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <button className="group flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-navy-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white mb-1">
                        Procuração
                      </h4>
                      <p className="text-xs text-slate-500 group-hover:text-primary-600 transition-colors font-medium">
                        Gerar Documento
                      </p>
                    </div>
                  </button>

                  <button className="group flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all text-center">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-navy-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                      <Scale size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold dark:text-white mb-1">
                        Hipossuficiência
                      </h4>
                      <p className="text-xs text-slate-500 group-hover:text-primary-600 transition-colors font-medium">
                        Gerar Declaração
                      </p>
                    </div>
                  </button>

                  {cases.some((c) => c.type === 'trabalhista') && (
                    <button className="group flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all text-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-navy-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">
                        <Briefcase size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold dark:text-white mb-1">
                          Contrato de Honorários
                        </h4>
                        <p className="text-xs text-slate-500 group-hover:text-primary-600 transition-colors font-medium">
                          Trabalhista
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'financeiro' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                {!client.financial_profile ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-navy-800/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/10 text-center">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-navy-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 font-bold text-xl">
                      <DollarSign size={40} />
                    </div>
                    <h4 className="text-xl font-bold dark:text-white mb-2">
                      Sem dados financeiros
                    </h4>
                    <p className="text-slate-500 max-w-xs text-sm">
                      Não há informações financeiras cadastradas para este
                      cliente.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                      {/* 1. Total Received */}
                      <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center min-h-[160px]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                          Total Recebido
                        </span>
                        <p className="text-2xl font-black text-emerald-500 tracking-tight">
                          {formatCurrency(totalPaidCount)}
                        </p>
                      </div>

                      {/* 2. Pending Balance */}
                      <div className="bg-[#0f172a] p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center min-h-[160px]">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                          Saldo Pendente Real
                        </span>
                        <p className="text-2xl font-black text-orange-500 tracking-tight">
                          {formatCurrency(remainingValue)}
                        </p>
                      </div>

                      {/* 3. Contract Value */}
                      <div className="bg-primary-600 p-8 rounded-[2.5rem] flex flex-col justify-center min-h-[160px] shadow-xl shadow-primary-500/20">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4">
                          Valor do Contrato
                        </span>
                        <p className="text-2xl font-black text-white tracking-tight">
                          {formatCurrency(displayTotalValue)}
                        </p>
                      </div>
                    </div>

                    {/* 4. Perfil de Contratação */}
                    <div className="bg-[#0f172a] p-10 rounded-[3rem] border border-white/5 space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                          Perfil de Contratação
                        </h3>
                        <div className="px-4 py-1.5 bg-slate-800/50 rounded-full border border-white/5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {client.financial_profile.payment_method ||
                              'Cartão de Crédito'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Entrada Real
                          </p>
                          <p className="text-xl font-black dark:text-white">
                            {entryRecord
                              ? formatCurrency(entryRecord.amount)
                              : 'R$ 0,00'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Parcelamento
                          </p>
                          <p className="text-xl font-black dark:text-white">
                            {client.financial_profile.num_parcelas_restante
                              ? `${client.financial_profile.num_parcelas_restante}x`
                              : 'N/A'}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Vencimento
                          </p>
                          <p className="text-xl font-black dark:text-white leading-tight">
                            Todo dia{' '}
                            {client.financial_profile.billing_day || 13}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Status
                          </p>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                            EM DIA
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* History and Deadlines */}
                    {client.type === 'particular' && (
                      <div className="md:col-span-2 space-y-4 pt-8 border-t border-white/5">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <DollarSign size={16} /> Histórico e Vencimentos
                        </h4>
                        <div className="bg-[#0f172a] rounded-[2.5rem] border border-white/5 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-[#1e293b]/50 border-b border-white/5">
                                <tr>
                                  <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                                    Descrição
                                  </th>
                                  <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                                    Vencimento
                                  </th>
                                  <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                                    Valor
                                  </th>
                                  <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">
                                    Status
                                  </th>
                                  <th className="px-8 py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">
                                    Ação
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {isLoadingFinances ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-8 py-12 text-center text-slate-400"
                                    >
                                      Carregando registros...
                                    </td>
                                  </tr>
                                ) : sortedRecords.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={5}
                                      className="px-8 py-12 text-center text-slate-400"
                                    >
                                      Nenhum lançamento encontrado.
                                    </td>
                                  </tr>
                                ) : (
                                  sortedRecords.map((record, idx) => (
                                    <tr
                                      key={record.id}
                                      className="group hover:bg-white/5 transition-colors"
                                    >
                                      <td className="px-8 py-6 font-bold dark:text-white uppercase text-xs">
                                        {record.category || 'Receita'}
                                      </td>
                                      <td className="px-8 py-6 text-slate-400 text-xs font-medium">
                                        {formatDate(record.due_date)}
                                      </td>
                                      <td className="px-8 py-6 font-black dark:text-white text-base">
                                        {formatCurrency(record.amount)}
                                      </td>
                                      <td className="px-8 py-6">
                                        {record.status === 'pago' ? (
                                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            PAGO
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            PENDENTE
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-8 py-6 text-right">
                                        {record.status !== 'pago' ? (
                                          <button className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 transition-colors group/btn">
                                            <CheckCircle2
                                              size={18}
                                              className="group-hover/btn:text-white"
                                            />
                                          </button>
                                        ) : null}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Labor Specifics */}
                    {client.financial_profile.percentual_acordado && (
                      <div className="md:col-span-2 bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <Briefcase size={16} /> Honorários de Êxito
                          (Trabalhista)
                        </h4>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-500 mb-1">
                              Percentual Acordado
                            </p>
                            <p className="text-3xl font-black text-primary-600">
                              {client.financial_profile.percentual_acordado}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-500 mb-1">
                              Valor Estimado Base
                            </p>
                            <p className="text-xl font-bold dark:text-white">
                              {client.financial_profile.valor_honorarios
                                ? formatCurrency(
                                    parseFloat(
                                      client.financial_profile.valor_honorarios
                                    )
                                  )
                                : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Guides / Custas */}
                    {client.type === 'defensoria' &&
                      (client.financial_profile.guia_principal ||
                        client.financial_profile.guia_recurso) && (
                        <div className="md:col-span-2 space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                            <Scale size={16} /> Guias e Custas Processuais
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {client.financial_profile.guia_principal && (
                              <div className="bg-slate-50 dark:bg-navy-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/10">
                                <div className="flex justify-between items-start mb-4">
                                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-white">
                                    Guia Principal (70%)
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                      client.financial_profile.guia_principal
                                        .status === 'Pago pelo Estado'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {
                                      client.financial_profile.guia_principal
                                        .status
                                    }
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-slate-500 font-bold">
                                      Protocolo
                                    </span>
                                    <span className="text-xs font-mono dark:text-white">
                                      {client.financial_profile.guia_principal
                                        .protocolo || '-'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-slate-500 font-bold">
                                      Valor
                                    </span>
                                    <span className="text-sm font-black dark:text-white">
                                      {client.financial_profile.guia_principal
                                        .valor
                                        ? formatCurrency(
                                            parseFloat(
                                              client.financial_profile
                                                .guia_principal.valor
                                            )
                                          )
                                        : '-'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-slate-500 font-bold">
                                      Data
                                    </span>
                                    <span className="text-xs dark:text-white">
                                      {client.financial_profile.guia_principal
                                        .data || '-'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {client.financial_profile.guia_recurso &&
                              client.financial_profile.tem_recurso && (
                                <div className="bg-slate-50 dark:bg-navy-800/50 p-6 rounded-3xl border border-slate-200 dark:border-white/10 opacity-75">
                                  <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-[10px] font-bold uppercase text-slate-600 dark:text-white">
                                      Guia Recurso (30%)
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                        client.financial_profile.guia_recurso
                                          .status === 'Pago pelo Estado'
                                          ? 'bg-green-100 text-green-700'
                                          : 'bg-amber-100 text-amber-700'
                                      }`}
                                    >
                                      {
                                        client.financial_profile.guia_recurso
                                          .status
                                      }
                                    </span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-xs text-slate-500 font-bold">
                                        Protocolo
                                      </span>
                                      <span className="text-xs font-mono dark:text-white">
                                        {client.financial_profile.guia_recurso
                                          .protocolo || '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-slate-500 font-bold">
                                        Valor
                                      </span>
                                      <span className="text-sm font-black dark:text-white">
                                        {client.financial_profile.guia_recurso
                                          .valor
                                          ? formatCurrency(
                                              parseFloat(
                                                client.financial_profile
                                                  .guia_recurso.valor
                                              )
                                            )
                                          : '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-xs text-slate-500 font-bold">
                                        Data
                                      </span>
                                      <span className="text-xs dark:text-white">
                                        {client.financial_profile.guia_recurso
                                          .data || '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-navy-800/50 flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:shadow-2xl active:scale-95"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
