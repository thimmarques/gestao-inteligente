
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, Edit2, ChevronRight, ChevronDown, Wallet, TrendingUp, Landmark,
  Circle, Loader2, RefreshCw, Check, CheckCheck, User, Briefcase, Trash2, Scale, Gavel,
  X, Save
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { financeService } from '../services/financeService';
import { seedFinances } from '../utils/seedFinances';
import { FinanceRecord, CaseType, Client } from '../types';
import { clientService } from '../services/clientService';

interface GroupedFinance {
  clientId: string;
  clientName: string;
  clientType: string;
  legalArea: CaseType | string;
  totalAmount: number;
  paidAmount: number;
  pendingCount: number;
  totalCount: number;
  records: FinanceRecord[];
}

const areaColorMap: Record<string, string> = {
  'cível': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  'trabalhista': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  'criminal': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  'família': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
  'tributário': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  'previdenciário': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400',
  'administrativo': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const Finance: React.FC = () => {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'geral' | 'particular' | 'defensoria'>('geral');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [preSelectedClientId, setPreSelectedClientId] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    seedFinances();
    const data = await financeService.getFinances();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const groupedData = useMemo(() => {
    const groups: Record<string, GroupedFinance> = {};

    records.forEach(r => {
      const cid = r.client_id || 'unlinked';
      if (!groups[cid]) {
        groups[cid] = {
          clientId: cid,
          clientName: r.client?.name || 'Sem Titular',
          clientType: (r.client as any)?.type || 'particular',
          legalArea: (r.case as any)?.type || 'cível',
          totalAmount: 0,
          paidAmount: 0,
          pendingCount: 0,
          totalCount: 0,
          records: []
        };
      }

      groups[cid].totalAmount += r.amount;
      groups[cid].totalCount += 1;
      groups[cid].records.push(r);

      if (r.status === 'pago') {
        groups[cid].paidAmount += r.amount;
      } else {
        groups[cid].pendingCount += 1;
      }
    });

    return Object.values(groups)
      .filter(g => activeTab === 'geral' || g.clientType === activeTab)
      .filter(g => g.clientName.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [records, activeTab, search]);

  const kpis = useMemo(() => {
    const totalConsolidada = records.filter(r => r.status === 'pago').reduce((acc, r) => acc + r.amount, 0);
    const aReceberParticular = records.filter(r => r.status !== 'pago' && (r.client as any)?.type === 'particular').reduce((acc, r) => acc + r.amount, 0);
    const estimativaDefensoria = records.filter(r => (r.client as any)?.type === 'defensoria').reduce((acc, r) => acc + r.amount, 0);

    return { totalConsolidada, aReceberParticular, estimativaDefensoria };
  }, [records]);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
    await financeService.updateRecord(id, { status: nextStatus as any, paid_date: nextStatus === 'pago' ? new Date().toISOString() : null });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este lançamento permanentemente?")) {
      await financeService.deleteRecord(id);
      loadData();
    }
  };

  const handleAddForClient = (clientId: string) => {
    setPreSelectedClientId(clientId);
    setIsAddModalOpen(true);
  };

  return (
    <div className="p-8 space-y-10 min-h-screen bg-[#f8fafc] dark:bg-slate-950 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">CONTROLE DE FLUXO</p>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financeiro</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gestão de honorários e guias consolidadas por cliente.</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-50 animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sincronizado com Clientes</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#ebf5ff] dark:bg-blue-900/10 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 relative overflow-hidden group transition-all">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Receita Efetivada</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-blue-400">R$</span>
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
              {kpis.totalConsolidada.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <Wallet className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-200/50 dark:text-blue-800/20" size={64} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm transition-all">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Prazos de Recebimento</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">R$</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {kpis.aReceberParticular.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </span>
          </div>
          <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-100 dark:text-slate-800/50" size={64} />
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden group shadow-sm transition-all">
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Volume Defensoria</p>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-slate-400">R$</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {kpis.estimativaDefensoria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Landmark className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-100 dark:text-slate-800/50" size={64} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex bg-[#f1f5f9] dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
          {[
            { id: 'geral', label: 'Geral' },
            { id: 'particular', label: 'Particular' },
            { id: 'defensoria', label: 'Defensoria' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por cliente ou processo associado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#fcfdfe] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Titularidade / Cliente</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Área</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contratação</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parcelas / Guias</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Acordado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
                  </td>
                </tr>
              ) : groupedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic">Nenhum registro financeiro encontrado.</td>
                </tr>
              ) : (
                groupedData.map((group) => {
                  const isExpanded = expandedRow === group.clientId;

                  return (
                    <React.Fragment key={group.clientId}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : group.clientId)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group ${isExpanded ? 'bg-slate-50/30 ring-1 ring-inset ring-slate-100' : ''}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">{group.clientName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                {group.records[0]?.case?.process_number || 'Sem processo vinculado'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border flex items-center gap-1.5 w-fit ${areaColorMap[group.legalArea] || 'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                            <Gavel size={10} />
                            {group.legalArea}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter border ${group.clientType === 'particular'
                            ? 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30'
                            : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30'
                            }`}>
                            {group.clientType}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                              {group.totalCount} {group.totalCount === 1 ? 'Lançamento' : 'Lançamentos'}
                            </span>
                            {group.pendingCount > 0 && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                {group.pendingCount} pendente
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-black dark:text-white tabular-nums">{formatCurrency(group.totalAmount)}</span>
                            <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${(group.paidAmount / group.totalAmount) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={(e) => { e.stopPropagation(); handleAddForClient(group.clientId); }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                            <Plus size={20} />
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="animate-in slide-in-from-top-2 duration-300">
                          <td colSpan={6} className="px-0 pb-6 bg-[#fcfdfe] dark:bg-slate-900/40">
                            <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/20 border-y border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detalhamento Financeiro</h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Vencimento ordenado</span>
                            </div>
                            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                              {group.records.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map((r) => (
                                <div key={r.id} className="flex items-center hover:bg-white dark:hover:bg-slate-800/50 transition-colors py-4 px-12 group/item">
                                  <div className="w-[35%] flex items-center gap-6">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'pago' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    <div className="min-w-0">
                                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest block truncate">
                                        {r.category}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase block mt-0.5">{r.notes || 'Sem observações'}</span>
                                    </div>
                                  </div>

                                  <div className="w-[15%] text-left">
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{formatDate(r.due_date)}</span>
                                      <span className="text-[8px] font-bold text-slate-400 uppercase">Vencimento</span>
                                    </div>
                                  </div>

                                  <div className="w-[15%] text-left">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${r.status === 'pago'
                                      ? 'bg-green-50 text-green-600 border-green-100'
                                      : 'bg-amber-50 text-amber-600 border-amber-100'
                                      }`}>
                                      {r.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="w-[20%] text-left">
                                    <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">
                                      {formatCurrency(r.amount)}
                                    </span>
                                  </div>

                                  <div className="w-[15%] text-right pr-4 flex justify-end gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleUpdateStatus(r.id, r.status)}
                                      className={`p-2 rounded-xl transition-all ${r.status === 'pago' ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100 hover:text-green-600'}`}
                                    >
                                      {r.status === 'pago' ? <CheckCheck size={16} /> : <Check size={16} />}
                                    </button>
                                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              ))}
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
        onClick={() => { setPreSelectedClientId(''); setIsAddModalOpen(true); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform" />
      </button>

      <CreateFinanceModal
        isOpen={isAddModalOpen}
        preSelectedClientId={preSelectedClientId}
        onClose={() => { setIsAddModalOpen(false); setPreSelectedClientId(''); }}
        onSave={async (data) => {
          await financeService.createRecord({
            ...data,
            lawyer_id: 'lawyer-1',
            office_id: 'office-1',
            created_at: new Date().toISOString()
          });
          loadData();
          setIsAddModalOpen(false);
          setPreSelectedClientId('');
        }}
      />
    </div>
  );
};

const CreateFinanceModal = ({ isOpen, onClose, onSave, preSelectedClientId }: any) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    type: 'receita' as const,
    category: 'Honorários Contratuais',
    amount: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'pendente' as const,
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      clientService.getClients().then(setClients);
      if (preSelectedClientId) {
        setFormData(prev => ({ ...prev, client_id: preSelectedClientId }));
      }
    }
  }, [isOpen, preSelectedClientId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white tracking-tight">Novo Lançamento</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><X size={20} /></button>
        </div>
        <form className="p-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, amount: parseFloat(formData.amount) }); }}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cliente Responsável</label>
            <select required value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm">
              <option value="">Selecione um cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm">
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm">
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor (R$)</label>
              <input required type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vencimento</label>
              <input required type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Observações</label>
            <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl dark:text-white text-sm resize-none" rows={3} />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Save size={20} /> Salvar Lançamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Finance;
