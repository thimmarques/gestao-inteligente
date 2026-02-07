import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Save, Search, Users, Loader2 } from 'lucide-react';
import { CaseStatus, CaseType } from '../../types.ts';
import { useClients } from '../../hooks/useQueries';
import { caseService } from '../../services/caseService';
import { useAuth } from '../../contexts/AuthContext';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { data: clients = [] } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const clientListRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    process_number: '',
    court: '',
    type: 'cível' as CaseType,
    status: 'distribuído' as CaseStatus,
    value: '',
    started_at: new Date().toISOString().split('T')[0],
    tags: '',
    notes: '',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        clientListRef.current &&
        !clientListRef.current.contains(event.target as Node)
      ) {
        setShowClientList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients.slice(0, 5);
    return (clients as any[])
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.cpf_cnpj.includes(searchTerm)
      )
      .slice(0, 10);
  }, [clients, searchTerm]);

  const selectedClient = clients.find((c: any) => c.id === formData.client_id);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await caseService.createCase({
        office_id: user.office_id,
        lawyer_id: user.id,
        client_id: formData.client_id,
        process_number: formData.process_number,
        court: formData.court,
        type: formData.type,
        status: formData.status,
        value: Number(formData.value) || 0,
        started_at: formData.started_at,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t !== ''),
        notes: formData.notes,
      });

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Erro ao cadastrar processo.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black dark:text-white tracking-tight">
              Novo Processo
            </h2>
            <p className="text-sm font-medium text-slate-500">
              Cadastre os dados básicos do caso jurídico.
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
          id="create-case-form"
          onSubmit={handleSubmit}
          className="p-10 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="col-span-full space-y-2 relative"
              ref={clientListRef}
            >
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Cliente
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  placeholder="Buscar cliente pelo nome ou CPF..."
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                  value={searchTerm || selectedClient?.name || ''}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                />
              </div>
              {showClientList && filteredClients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredClients.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, client_id: c.id });
                        setShowClientList(false);
                        setSearchTerm('');
                      }}
                      className="w-full px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors"
                    >
                      <p className="text-sm font-bold dark:text-white">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                        {c.cpf_cnpj}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Número do Processo
              </label>
              <input
                required
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white font-mono text-sm shadow-inner outline-none transition-all"
                value={formData.process_number}
                onChange={(e) =>
                  setFormData({ ...formData, process_number: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Tribunal/Vara
              </label>
              <input
                required
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                value={formData.court}
                onChange={(e) =>
                  setFormData({ ...formData, court: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Área do Direito
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none transition-all"
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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Status Inicial
              </label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none transition-all"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="distribuído">Distribuído</option>
                <option value="andamento">Andamento</option>
                <option value="sentenciado">Sentenciado</option>
                <option value="recurso">Recurso</option>
                <option value="arquivado">Arquivado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Valor da Causa (R$)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Data de Início
              </label>
              <input
                type="date"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                value={formData.started_at}
                onChange={(e) =>
                  setFormData({ ...formData, started_at: e.target.value })
                }
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Tags (separadas por vírgula)
              </label>
              <input
                placeholder="ex: urgente, liminar, contestação"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                Notas e Observações
              </label>
              <textarea
                rows={3}
                placeholder="Informações relevantes sobre este processo..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner outline-none transition-all"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
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
            form="create-case-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Salvar Processo
          </button>
        </div>
      </div>
    </div>
  );
};
