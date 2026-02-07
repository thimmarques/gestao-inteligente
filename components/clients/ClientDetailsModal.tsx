import React, { useState } from 'react';
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
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Client, ClientType } from '../../types';
import {
  formatCurrency,
  formatDate,
  formatCPF,
  formatPhone,
} from '../../utils/formatters';
import { useCases } from '../../hooks/useQueries';

interface ClientDetailsModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (client: Client) => void;
  onOpenCase: (caseId: string) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  isOpen,
  onClose,
  onEdit,
  onOpenCase,
}) => {
  const { data: cases = [], isLoading: isLoadingCases } = useCases({
    client_id: client?.id,
  });
  const [activeTab, setActiveTab] = useState<
    'geral' | 'processos' | 'financeiro' | 'documentos'
  >('geral');

  if (!isOpen || !client) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="p-10 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
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
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all active:scale-95 shadow-sm"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-slate-500 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-10 border-b border-slate-100 dark:border-slate-800 flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0">
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
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/20">
          <div className="max-w-4xl mx-auto h-full animate-in fade-in duration-500">
            {activeTab === 'geral' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Informações de Contato
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
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
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-300 hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100"
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
                          className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-2"
                        >
                          <Mail size={14} />
                          {client.email || 'Não informado'}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Telefone
                        </p>
                        <a
                          href={`tel:${client.phone}`}
                          className="text-sm font-bold dark:text-white flex items-center gap-2"
                        >
                          <Phone size={14} className="text-primary-500" />
                          {formatPhone(client.phone)}
                        </a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Cidade / Estado
                        </p>
                        <p className="text-sm font-medium dark:text-slate-300">
                          São Paulo, SP
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">
                      Notas e Observações
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      "
                      {client.notes ||
                        'Nenhuma nota adicional para este cliente.'}
                      "
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-primary-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary-500/20">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-6">
                      Perfil Estratégico
                    </h4>
                    {client.type === ClientType.PARTICULAR ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">
                              Ticket Médio
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(
                                client.financial_profile?.hourly_rate || 0
                              )}
                              /h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">
                              Retainer
                            </p>
                            <p className="text-lg font-bold">
                              {formatCurrency(
                                client.financial_profile?.retainer_fee || 0
                              )}
                              /mês
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold opacity-60">
                              Comarca
                            </p>
                            <p className="text-lg font-bold">
                              {client.financial_profile?.comarca || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600">
                      <Briefcase size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold dark:text-white">
                        {client.process_count}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Processos Ativos
                      </p>
                    </div>
                    <button className="w-full py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary-600 hover:text-white transition-all">
                      Abrir Novo Processo
                    </button>
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
                        className="group bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                        onClick={() => onOpenCase(process.id)}
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
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
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
                  <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
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

            {activeTab !== 'geral' && activeTab !== 'processos' && (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 font-bold text-xl">
                  {activeTab === 'financeiro' ? (
                    <DollarSign size={40} />
                  ) : (
                    <Files size={40} />
                  )}
                </div>
                <h4 className="text-xl font-bold dark:text-white mb-2">
                  Dados de {activeTab}
                </h4>
                <p className="text-slate-500 max-w-xs text-sm">
                  Os registros detalhados de {activeTab} para este cliente estão
                  sendo reconciliados.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-4 shrink-0">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:shadow-2xl active:scale-95"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
