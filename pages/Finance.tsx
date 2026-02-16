import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Loader2,
  Check,
  CheckCheck,
  Trash2,
  Gavel,
  X,
  Save,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  User,
  Briefcase,
  Minus,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency, formatDate } from '../utils/formatters';
import { financeService } from '../services/financeService';
import { clientService } from '../services/clientService';
import { caseService } from '../services/caseService';
import { seedFinances } from '../utils/seedFinances';
import { FinanceRecord, Client, Case } from '../types';
import { useAuth } from '../contexts/AuthContext';

const areaColorMap: Record<string, string> = {
  cível:
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  trabalhista:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  criminal:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  família:
    'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  tributário:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  previdenciário:
    'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
  administrativo:
    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const Finance: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'geral' | 'particular' | 'defensoria' | 'despesas'
  >('geral');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(
    null
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    seedFinances();
    try {
      const data = await financeService.getFinances();
      setRecords(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (activeTab === 'despesas') return r.type === 'despesa';
        if (activeTab === 'particular')
          return r.type === 'receita' && r.client?.type === 'particular';
        if (activeTab === 'defensoria')
          return r.type === 'receita' && r.client?.type === 'defensoria';
        return true;
      })
      .filter((r) => {
        const term = search.toLowerCase();
        return (
          r.category.toLowerCase().includes(term) ||
          r.client?.name?.toLowerCase().includes(term) ||
          r.case?.process_number?.toLowerCase().includes(term) ||
          (r.notes && r.notes.toLowerCase().includes(term))
        );
      });
  }, [records, activeTab, search]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, FinanceRecord[]> = {};

    filteredRecords.forEach((r) => {
      // Group by client_id for revenues; expenses generally stay separate (grouped by their own id)
      const groupId = r.client_id || `expense-${r.id}`;
      if (!groups[groupId]) groups[groupId] = [];
      groups[groupId].push(r);
    });

    return Object.entries(groups)
      .map(([groupId, items]) => {
        const sortedItems = [...items].sort(
          (a, b) =>
            new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );

        // Find main record: Priority 1: Paid; Priority 2: Closest due date
        const paidItems = sortedItems.filter((i) => i.status === 'pago');
        const mainRecord =
          paidItems.length > 0
            ? paidItems[paidItems.length - 1]
            : sortedItems[0];

        return {
          id: groupId,
          mainRecord,
          items: sortedItems,
          isGroup: items.length > 1,
        };
      })
      .sort((a, b) => {
        // Sort groups by the main record's due date (latest first)
        return (
          new Date(b.mainRecord.due_date).getTime() -
          new Date(a.mainRecord.due_date).getTime()
        );
      });
  }, [filteredRecords]);

  const kpis = useMemo(() => {
    const paidRevenues = records
      .filter((r) => r.type === 'receita' && r.status === 'pago')
      .reduce((acc, r) => acc + r.amount, 0);
    const paidExpenses = records
      .filter((r) => r.type === 'despesa' && r.status === 'pago')
      .reduce((acc, r) => acc + r.amount, 0);
    const pendingRevenues = records
      .filter((r) => r.type === 'receita' && r.status !== 'pago')
      .reduce((acc, r) => acc + r.amount, 0);

    return {
      saldoGeral: paidRevenues - paidExpenses,
      entradas: paidRevenues,
      saidas: paidExpenses,
      pendente: pendingRevenues,
    };
  }, [records]);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    await financeService.updateRecord(id, {
      status: nextStatus as any,
      paid_date: nextStatus === 'pago' ? new Date().toISOString() : null,
    });
    toast.success('Status atualizado com sucesso!');
    queryClient.invalidateQueries({ queryKey: ['finances'] });
    loadData();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remover este lançamento permanentemente?')) {
      await financeService.deleteRecord(id);
      toast.success('Lançamento removido com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      loadData();
    }
  };

  const handleEdit = (record: FinanceRecord) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 space-y-10 min-h-screen bg-slate-50 dark:bg-navy-950 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">
            CONTROLE DE FLUXO
          </p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Financeiro
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gestão individual de honorários e despesas operacionais.
          </p>
        </div>
      </header>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px] glass-card">
          <ArrowUpRight
            className="absolute top-6 right-6 text-slate-500 opacity-60"
            size={16}
          />
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-primary-500 mb-4">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              SALDO GERAL
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
              {formatCurrency(kpis.saldoGeral)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between min-h-[140px] glass-card">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              ENTRADAS
            </p>
            <p className="text-2xl font-black text-green-600 dark:text-green-500 tabular-nums">
              {formatCurrency(kpis.entradas)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between min-h-[140px] glass-card">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
            <ArrowDownRight size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              SAÍDAS
            </p>
            <p className="text-2xl font-black text-red-600 dark:text-red-500 tabular-nums">
              {formatCurrency(kpis.saidas)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-[2rem] border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between min-h-[140px] glass-card">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              PENDENTE
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-500 tabular-nums">
              {formatCurrency(kpis.pendente)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-4">
        <div className="flex bg-[#f1f5f9] dark:bg-navy-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 w-fit">
          {[
            { id: 'geral', label: 'Geral' },
            { id: 'particular', label: 'Particular' },
            { id: 'defensoria', label: 'Defensoria' },
            { id: 'despesas', label: 'Despesas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-navy-800 text-primary-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por categoria, cliente ou observações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 dark:text-white shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfdfe] dark:bg-navy-800/50 border-b border-slate-100 dark:border-white/10">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Titularidade / Registro
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Área
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Vencimento
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Valor
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2
                      className="animate-spin text-primary-600 mx-auto"
                      size={32}
                    />
                  </td>
                </tr>
              ) : groupedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-20 text-center text-slate-400 italic font-medium"
                  >
                    Nenhum registro encontrado para esta categoria.
                  </td>
                </tr>
              ) : (
                groupedRecords.map((group) => {
                  const record = group.mainRecord;
                  const isExpanded = expandedId === group.id;
                  const isExpense = record.type === 'despesa';
                  const hasClientArea = !isExpense && record.client_id;
                  const areaLabel = hasClientArea
                    ? record.case?.type ||
                      record.client?.financial_profile?.process_type ||
                      'CÍVEL'
                    : '-';

                  return (
                    <React.Fragment key={group.id}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : group.id)
                        }
                        className={`hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${isExpanded ? 'bg-slate-50/30' : ''}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-navy-800 text-slate-400'}`}
                            >
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                                  {isExpense
                                    ? record.category
                                    : record.client?.name ||
                                      record.category ||
                                      'Sem Titular'}
                                </p>
                                {group.isGroup && (
                                  <span className="px-1.5 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[9px] font-black">
                                    {group.items.length} PARCELAS
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {isExpense
                                  ? 'GASTO OPERACIONAL'
                                  : record.case?.process_number ||
                                    'SEM PROCESSO VINCULADO'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {hasClientArea ? (
                            <span
                              className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border flex items-center gap-1.5 w-fit ${
                                areaColorMap[areaLabel.toLowerCase()] ||
                                'bg-slate-50 text-slate-500 border-slate-200 dark:bg-navy-800/50 dark:border-white/10'
                              }`}
                            >
                              <Gavel size={10} />
                              {areaLabel}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 flex items-center gap-1.5">
                              <Minus size={14} />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              record.status === 'pago'
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : record.status === 'vencido'
                                  ? 'bg-red-50 text-red-600 border-red-100'
                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}
                          >
                            {record.status.toUpperCase()}
                          </span>
                        </td>
                        <td
                          className="px-6 py-6"
                          title={
                            group.isGroup
                              ? 'Data da parcela principal exibida'
                              : ''
                          }
                        >
                          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                            {formatDate(record.due_date)}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span
                            className={`text-sm font-black tabular-nums ${isExpense ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}
                          >
                            {formatCurrency(record.amount)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(record.id, record.status);
                              }}
                              className={`p-2 rounded-xl transition-all ${record.status === 'pago' ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-green-600'}`}
                            >
                              {record.status === 'pago' ? (
                                <CheckCheck size={18} />
                              ) : (
                                <Check size={18} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(record);
                              }}
                              className="p-2 text-slate-300 hover:text-primary-500 transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, record.id)}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="animate-in slide-in-from-top-2 duration-300">
                          <td
                            colSpan={6}
                            className="px-8 pb-8 pt-2 bg-slate-50/30 dark:bg-white/5"
                          >
                            <div className="space-y-4">
                              {/* If it's a group, show the list of installments first */}
                              {group.isGroup && (
                                <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm overflow-hidden">
                                  <div className="px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                      Todas as Parcelas / Lançamentos
                                    </h4>
                                  </div>
                                  <div className="divide-y divide-slate-50 dark:divide-white/5">
                                    {group.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                      >
                                        <div className="flex items-center gap-6">
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                              Vencimento
                                            </p>
                                            <p className="text-xs font-black dark:text-white">
                                              {formatDate(item.due_date)}
                                            </p>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                              Status
                                            </p>
                                            <span
                                              className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                                                item.status === 'pago'
                                                  ? 'bg-green-50 text-green-600 border-green-100'
                                                  : 'bg-amber-50 text-amber-600 border-amber-100'
                                              }`}
                                            >
                                              {item.status}
                                            </span>
                                          </div>
                                          <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                              Valor
                                            </p>
                                            <p className="text-xs font-black dark:text-white">
                                              {formatCurrency(item.amount)}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleUpdateStatus(
                                                item.id,
                                                item.status
                                              );
                                            }}
                                            className={`p-1.5 rounded-lg transition-all ${item.status === 'pago' ? 'text-green-600 bg-green-50' : 'text-slate-300 hover:text-green-600'}`}
                                          >
                                            {item.status === 'pago' ? (
                                              <CheckCheck size={14} />
                                            ) : (
                                              <Check size={14} />
                                            )}
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEdit(item);
                                            }}
                                            className="p-1.5 text-slate-300 hover:text-primary-500 transition-colors"
                                          >
                                            <Edit size={14} />
                                          </button>
                                          <button
                                            onClick={(e) =>
                                              handleDelete(e, item.id)
                                            }
                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Details Card for the Main Record (or just keep it general) */}
                              <div className="p-6 bg-white dark:bg-navy-900 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Detalhamento do Registro Principal
                                  </h4>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    Lançado em {formatDate(record.created_at)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      Categoria / Título
                                    </p>
                                    <p className="text-sm font-bold dark:text-white">
                                      {record.category}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      Forma de Pagamento
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-bold dark:text-white">
                                      <CreditCard
                                        size={14}
                                        className="text-primary-500"
                                      />
                                      {record.payment_method || 'Não informada'}
                                    </div>
                                  </div>
                                  {record.paid_date && (
                                    <div className="space-y-1">
                                      <p className="text-[10px] font-bold text-green-600 uppercase">
                                        Data da Liquidação
                                      </p>
                                      <p className="text-sm font-bold text-green-600">
                                        {formatDate(record.paid_date)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1 pt-2">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Observações
                                  </p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                    "
                                    {record.notes ||
                                      'Nenhuma nota adicional para este registro.'}
                                    "
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => {
          setEditingRecord(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-8 right-8 flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl font-black uppercase tracking-widest transition-all z-50 group hover:scale-105 active:scale-95 btn-electric"
      >
        <Plus
          size={24}
          className="group-hover:rotate-90 transition-transform"
        />
        Novo Registro
      </button>

      <CreateFinanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        initialData={editingRecord}
        onSave={async (data: any) => {
          if (editingRecord) {
            await financeService.updateRecord(editingRecord.id, data);
          } else {
            if (!user?.office_id) {
              toast.error(
                'Erro: Usuário não autenticado ou sem escritório vinculado.'
              );
              return;
            }
            await financeService.createRecord({
              ...data,
              lawyer_id: user.id,
              office_id: user.office_id,
              created_at: new Date().toISOString(),
            });
            toast.success('Novo registro criado com sucesso!');
          }
          loadData();
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
      />
    </div>
  );
};

const CreateFinanceModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    case_id: '',
    type: 'receita' as 'receita' | 'despesa',
    category: 'Honorários',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'pendente' as const,
    notes: '',
    title: '',
    payment_method: 'PIX',
    is_from_client: true,
  });

  useEffect(() => {
    if (isOpen) {
      clientService.getClients().then(setClients);
      caseService.getCases().then(setCases);
      if (initialData) {
        setFormData({
          client_id: initialData.client_id || '',
          case_id: initialData.case_id || '',
          type: initialData.type,
          category: initialData.category,
          amount: initialData.amount.toString(),
          due_date: initialData.due_date.split('T')[0],
          status: initialData.status,
          notes: initialData.notes || '',
          title: initialData.category || '',
          payment_method: initialData.payment_method || 'PIX',
          is_from_client: !!initialData.client_id,
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isRevenue = formData.type === 'receita';

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] dark:bg-navy-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="px-10 pt-10 pb-6 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {initialData ? 'Editar Registro' : 'Novo Registro'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Gestão inteligente de fluxo de caixa.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-primary-500 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <form
          className="p-10 pt-0 space-y-8 flex-1 overflow-y-auto custom-scrollbar"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...formData,
              category: formData.title || (isRevenue ? 'Receita' : 'Despesa'),
              amount: parseFloat(formData.amount) || 0,
              client_id:
                isRevenue && formData.is_from_client
                  ? formData.client_id
                  : null,
              case_id:
                isRevenue && formData.is_from_client ? formData.case_id : null,
            });
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'receita' })}
              className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                isRevenue
                  ? 'bg-green-500/10 border-green-500 text-green-500 shadow-lg'
                  : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/5 text-slate-500'
              }`}
            >
              <TrendingUp size={18} /> RECEITA
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'despesa' })}
              className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all font-black uppercase tracking-widest text-xs ${
                !isRevenue
                  ? 'bg-red-500/10 border-red-500 text-red-500 shadow-lg'
                  : 'bg-slate-50 dark:bg-navy-800 border-slate-200 dark:border-white/5 text-slate-500'
              }`}
            >
              <TrendingDown size={18} /> DESPESA
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
              {isRevenue ? 'Título / Categoria' : 'Tipo de Despesa'}
            </label>
            {isRevenue ? (
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ex: Honorários Adicionais, Consulta..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white placeholder:text-slate-400 transition-all shadow-inner"
              />
            ) : (
              <select
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none shadow-inner"
              >
                <option value="">Selecione a categoria...</option>
                <option value="Aluguel">Aluguel</option>
                <option value="Energia / Luz">Energia / Luz</option>
                <option value="Internet / Telefone">Internet / Telefone</option>
                <option value="Software / SaaS">Software / SaaS</option>
                <option value="Marketing">Marketing</option>
                <option value="Salários / Pró-labore">
                  Salários / Pró-labore
                </option>
                <option value="Impostos / Taxas">Impostos / Taxas</option>
                <option value="Papelaria / Insumos">Papelaria / Insumos</option>
                <option value="Outros">Outros</option>
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                  $
                </span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0,00"
                  className="w-full pl-10 pr-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white font-black text-lg shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                Vencimento
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  required
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                Forma de Pagamento
              </label>
              <div className="relative">
                <CreditCard
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={16}
                />
                <select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none shadow-inner"
                >
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none shadow-inner"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </div>

          {isRevenue && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-800/30 rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-primary-500" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Vem de algum cliente?
                  </span>
                </div>
                <div className="flex bg-slate-100 dark:bg-navy-900 p-1 rounded-xl shadow-inner border border-slate-200 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, is_from_client: true })
                    }
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.is_from_client ? 'bg-primary-600 text-white shadow-md' : 'text-slate-400'}`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        is_from_client: false,
                        client_id: '',
                        case_id: '',
                      })
                    }
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!formData.is_from_client ? 'bg-slate-300 dark:bg-navy-700 text-white shadow-md' : 'text-slate-400'}`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {formData.is_from_client && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                      Selecionar Cliente
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                        size={18}
                      />
                      <select
                        value={formData.client_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            client_id: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none shadow-inner"
                      >
                        <option value="">Selecione o cliente...</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>

                  {formData.client_id && (
                    <div className="space-y-2 animate-in fade-in">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
                        Processo Associado (Opcional)
                      </label>
                      <div className="relative">
                        <Briefcase
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                          size={18}
                        />
                        <select
                          value={formData.case_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              case_id: e.target.value,
                            })
                          }
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none shadow-inner"
                        >
                          <option value="">Selecione o processo...</option>
                          {cases
                            .filter((c) => c.client_id === formData.client_id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.process_number}
                              </option>
                            ))}
                        </select>
                        <ChevronDown
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                          size={16}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block ml-1">
              Descrição / Notas
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Detalhes adicionais sobre este lançamento..."
              className="w-full px-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-[1.5rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
            />
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex items-center justify-between sticky bottom-0 bg-white dark:bg-navy-900 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
            >
              <Save size={20} /> {initialData ? 'ATUALIZAR' : 'SALVAR REGISTRO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Finance;
