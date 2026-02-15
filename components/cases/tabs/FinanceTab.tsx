import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Wallet,
  CreditCard,
  User,
  Trash2,
  CheckCircle2,
  XCircle,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '../../../utils/formatters.ts';
import { useFinancesByCase, useCase } from '../../../hooks/useQueries';
import { financeService } from '../../../services/financeService';

interface FinanceTabProps {
  caseId: string;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({ caseId }) => {
  const queryClient = useQueryClient();
  const { data: caseData } = useCase(caseId);
  const { data: records = [], isLoading } = useFinancesByCase(
    caseId,
    caseData?.client_id
  );

  const totalRevenue = records
    .filter((r) => r.type === 'receita' && r.status === 'pago')
    .reduce((acc, r) => acc + r.amount, 0);

  const saldoAReceber = records
    .filter((r) => r.type === 'receita' && r.status !== 'pago')
    .reduce((acc, r) => acc + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === 'despesa')
    .reduce((acc, r) => acc + r.amount, 0);

  const balance = totalRevenue - totalExpense;

  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => {
      // 1. Pago first
      if (a.status === 'pago' && b.status !== 'pago') return -1;
      if (a.status !== 'pago' && b.status === 'pago') return 1;

      // 2. Due date ascending (earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }, [records]);

  const financialProfile = caseData?.client?.financial_profile;
  const honorariosAcordados = financialProfile?.honorarios_firmados
    ? parseFloat(financialProfile.honorarios_firmados)
    : 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await financeService.deleteRecord(id);
      queryClient.invalidateQueries({ queryKey: ['finances', 'case', caseId] });
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir lançamento.');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'pago' ? 'pendente' : 'pago';
      await financeService.updateRecord(id, {
        status: newStatus as any,
        paid_date: newStatus === 'pago' ? new Date().toISOString() : null,
      });
      queryClient.invalidateQueries({ queryKey: ['finances', 'case', caseId] });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuration & Contract Summary */}
      <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden group">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Perfil de Cobrança */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-primary-400" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                Perfil de Cobrança
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                  Titular do Pagamento
                </p>
                <p className="text-sm font-bold dark:text-white">
                  {caseData?.client?.name || '---'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                  Forma de Pagamento
                </p>
                <div className="flex items-center gap-2 text-sm font-bold dark:text-white">
                  <CreditCard size={14} className="text-primary-500" />
                  {financialProfile?.payment_method || '---'}
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Contrato */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-green-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40">
                Resumo do Contrato
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                  Honorários Acordados
                </p>
                <p className="text-sm font-black text-primary-500">
                  {formatCurrency(honorariosAcordados)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                  A Receber Total
                </p>
                <p className="text-sm font-black text-orange-500">
                  {formatCurrency(saldoAReceber)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm group hover:border-green-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em]">
              Total Receitas
            </span>
          </div>
          <p className="text-3xl font-black text-green-500 tracking-tight">
            {formatCurrency(totalRevenue)}
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800/50 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-sm group hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <CreditCard size={20} />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-white/40 uppercase tracking-[0.2em]">
              Saldo a Receber
            </span>
          </div>
          <p className="text-3xl font-black text-orange-500 tracking-tight">
            {formatCurrency(saldoAReceber)}
          </p>
        </div>

        <div className="bg-primary-600 p-8 rounded-[2.5rem] border border-primary-500 shadow-xl shadow-primary-900/20 group transition-all transform hover:scale-[1.02]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Wallet size={20} />
            </div>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
              Saldo Processo
            </span>
          </div>
          <p className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Tipo
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Categoria
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Valor
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Vencimento
                </th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-white/30 uppercase tracking-[0.2em] text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <Loader2
                      size={32}
                      className="animate-spin text-primary-600 mx-auto mb-4"
                    />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      Carregando transações...
                    </p>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                sortedRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.type === 'receita' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                      >
                        {r.type === 'receita' ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownRight size={18} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold dark:text-white">
                      {r.category}
                    </td>
                    <td
                      className={`px-6 py-6 font-black tabular-nums text-lg ${r.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {r.type === 'receita' ? '+' : '-'}{' '}
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-6 py-6 text-sm font-medium text-slate-500">
                      {formatDate(r.due_date)}
                    </td>
                    <td className="px-6 py-6">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          r.status === 'pago'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : r.status === 'vencido'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                        }`}
                      >
                        {r.status === 'pago' ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {r.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleToggleStatus(r.id, r.status)}
                          className={`p-2.5 rounded-2xl transition-all duration-300 group/btn border ${
                            r.status === 'pago'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                          title={
                            r.status === 'pago'
                              ? 'Marcar como Pendente'
                              : 'Marcar como Pago'
                          }
                        >
                          {r.status === 'pago' ? (
                            <CheckCheck size={18} />
                          ) : (
                            <Check size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-2xl transition-all shadow-sm"
                          title="Excluir Lançamento"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-8 py-24 text-center text-slate-500 space-y-4"
                  >
                    <div className="flex justify-center">
                      <Wallet
                        size={48}
                        className="text-slate-200 dark:text-white/5"
                      />
                    </div>
                    <p className="text-sm font-medium">
                      Nenhuma transação financeira vinculada a este processo.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
