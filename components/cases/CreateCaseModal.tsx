import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, Search, User, Lock } from 'lucide-react';
import { Client } from '../../types';
import { clientService } from '../../services/clientService';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: (clientId: string) => void;
  initialClientId?: string;
}

import { caseService } from '../../services/caseService';

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialClientId,
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    process_number: '',
    court: '',
    type: 'cível',
    status: 'andamento',
    value: '',
    started_at: new Date().toISOString().split('T')[0],
    tags: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      clientService.getClients().then(setClients);
      if (initialClientId) {
        setFormData((prev) => ({ ...prev, client_id: initialClientId }));
      }
    }
  }, [isOpen, initialClientId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user?.office_id) {
        alert('Erro: Usuário não autenticado ou sem escritório vinculado.');
        return;
      }

      await caseService.createCase({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        value: Number(formData.value) || 0,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t !== ''),
        lawyer_id: user.id,
        office_id: user.office_id,
      } as any);

      if (onSaveSuccess) onSaveSuccess(formData.client_id);
      onClose();
    } catch (error) {
      console.error('Error creating case', error);
      alert('Erro ao criar caso');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">
              Novo Processo
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Distribua um novo caso vinculando a um cliente.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-10 overflow-y-auto custom-scrollbar space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Vincular Cliente*
              </label>
              <div className="relative">
                {initialClientId ? (
                  <div className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      size={18}
                    />
                    {clients.find((c) => c.id === initialClientId)?.name ||
                      'Cliente Selecionado'}
                  </div>
                ) : (
                  <>
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <select
                      required
                      value={formData.client_id}
                      onChange={(e) =>
                        setFormData({ ...formData, client_id: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                    >
                      <option value="">
                        Selecione o cliente responsável...
                      </option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({formatCPF(c.cpf_cnpj)})
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Número do Processo (CNJ)
              </label>
              <input
                placeholder="0000000-00.0000.0.00.0000"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white font-mono text-sm shadow-inner"
                value={formData.process_number}
                onChange={(e) =>
                  setFormData({ ...formData, process_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Tribunal/Vara
              </label>
              <input
                placeholder="Ex: 1ª Vara Cível de Sertãozinho"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner"
                value={formData.court}
                onChange={(e) =>
                  setFormData({ ...formData, court: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Área Jurídica
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
              >
                <option value="cível">Cível</option>
                <option value="trabalhista">Trabalhista</option>
                <option value="criminal">Criminal</option>
                <option value="família">Família</option>
                <option value="tributário">Tributário</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Status
              </label>
              <select
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="distribuído">Distribuído</option>
                <option value="andamento">Em Andamento</option>
                <option value="sentenciado">Sentenciado</option>
                <option value="recurso">Em Recurso</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Valor da Causa (R$)
              </label>
              <input
                type="number"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Data de Distribuição
              </label>
              <input
                type="date"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                value={formData.started_at}
                onChange={(e) =>
                  setFormData({ ...formData, started_at: e.target.value })
                }
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">
                Notas e Objeto da Ação
              </label>
              <textarea
                rows={4}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>

          <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-3 px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary-500/30 active:scale-95"
            >
              <Save size={20} />
              Salvar e Vincular
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function formatCPF(v: string) {
  v = v.replace(/\D/g, '');
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    v = v.replace(/^(\d{2})(\d)/, '$1.$2');
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
    v = v.replace(/(\d{4})(\d)/, '$1-$2');
  }
  return v;
}
