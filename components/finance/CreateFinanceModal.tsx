import React, { useState, useMemo } from 'react';
import {
  X,
  Save,
  Search,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
} from 'lucide-react';
import { useCases, useClients } from '../../hooks/useQueries';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateFinanceModal: React.FC<CreateFinanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { data: cases = [] } = useCases();
  const { data: clients = [] } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'receita' as 'receita' | 'despesa',
    category: 'honorários',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pendente' as 'pago' | 'pendente' | 'atrasado',
    client_id: '',
    case_id: '',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await financeService.createRecord({
        office_id: user.office_id,
        lawyer_id: user.id,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        due_date: formData.date,
        status: formData.status as any,
        client_id: formData.client_id || null,
        case_id: formData.case_id || null,
        notes: formData.description,
      });

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Erro ao salvar registro financeiro.');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">
              Novo Registro
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Controle suas receitas e despesas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form
          id="create-finance-form"
          onSubmit={handleSubmit}
          className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar"
        >
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'receita' })}
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.type === 'receita' ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
            >
              <TrendingUp size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Receita
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'despesa' })}
              className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.type === 'despesa' ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-slate-50 dark:border-slate-800 text-slate-400'}`}
            >
              <TrendingDown size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Despesa
              </span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Título do Lançamento
            </label>
            <input
              required
              placeholder="Ex: Honorários Case X, Aluguel, Token"
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Valor (R$)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-bold shadow-inner outline-none transition-all"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Data
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="date"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Categoria
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none shadow-sm transition-all"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="honorários">Honorários</option>
                <option value="custas">Custas</option>
                <option value="manutenção">Manutenção</option>
                <option value="pessoal">Pessoal</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Status
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none shadow-sm transition-all font-bold"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="atrasado">Atrasado</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Vincular Processo (Opcional)
            </label>
            <select
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none shadow-sm transition-all"
              value={formData.case_id}
              onChange={(e) =>
                setFormData({ ...formData, case_id: e.target.value })
              }
            >
              <option value="">Nenhum processo</option>
              {cases.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.process_number} - {c.client?.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Descrição / Notas
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes sobre o lançamento..."
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner outline-none transition-all"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
        </form>

        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
          >
            Cancelar
          </button>
          <button
            form="create-finance-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Salvar Registro
          </button>
        </div>
      </div>
    </div>
  );
};
