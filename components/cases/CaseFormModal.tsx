import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader2, Info, AlertCircle, Tag } from 'lucide-react';
import { CaseStatus, CaseType, Client } from '../../types';

interface CaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export const CaseFormModal: React.FC<CaseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    process_number: '',
    client_id: '',
    court: '',
    type: 'cível' as CaseType,
    status: CaseStatus.DISTRIBUIDO,
    outcome: 'em_andamento' as 'ganho' | 'perdido' | 'acordo' | 'em_andamento',
    value: '',
    started_at: new Date().toISOString().split('T')[0],
    notes: '',
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const firstInputRef = useRef<HTMLSelectElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { clientService } = await import('../../services/clientService');
        const data = await clientService.getClients();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };

    fetchClients();

    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        client_id: initialData.client_id || prev.client_id,
        outcome: initialData.outcome || 'em_andamento',
      }));
    }

    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    // Todos os campos são opcionais agora
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (formData.tags.length >= 10) return;
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-navy-800/50 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300"
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
            <div>
              <h2
                id="modal-title"
                className="text-xl font-bold dark:text-white"
              >
                {initialData?.id ? 'Editar Processo' : 'Novo Processo'}
              </h2>
              <p className="text-sm text-slate-500">
                Insira os detalhes do caso (todos os campos opcionais).
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Info size={14} /> Informações Judiciais Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label
                    htmlFor="client_id"
                    className="text-sm font-bold dark:text-slate-300 block"
                  >
                    Cliente
                  </label>
                  <select
                    id="client_id"
                    ref={firstInputRef}
                    disabled={!!initialData?.client_id && !initialData.id}
                    value={formData.client_id}
                    onChange={(e) =>
                      setFormData({ ...formData, client_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-2 rounded-xl dark:text-white focus:ring-0 border-transparent focus:border-primary-500 transition-all"
                  >
                    <option value="">Selecione um cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="process_number"
                    className="text-sm font-bold dark:text-slate-300 block"
                  >
                    Número do Processo (CNJ)
                  </label>
                  <input
                    id="process_number"
                    type="text"
                    placeholder="0000000-00.0000.0.00.0000"
                    value={formData.process_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        process_number: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-2 rounded-xl dark:text-white focus:ring-0 border-transparent focus:border-primary-500 transition-all font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label
                    htmlFor="court"
                    className="text-sm font-bold dark:text-slate-300 block"
                  >
                    Tribunal e Vara
                  </label>
                  <input
                    id="court"
                    type="text"
                    placeholder="Ex: 1ª Vara Cível de São Paulo"
                    value={formData.court}
                    onChange={(e) =>
                      setFormData({ ...formData, court: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-2 rounded-xl dark:text-white focus:ring-0 border-transparent focus:border-primary-500 transition-all"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Classificação e Finanças
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="type"
                    className="text-sm font-bold dark:text-slate-300 block mb-1"
                  >
                    Área
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as CaseType,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-xl dark:text-white focus:ring-2 ring-primary-500"
                  >
                    <option value="cível">Cível</option>
                    <option value="trabalhista">Trabalhista</option>
                    <option value="criminal">Criminal</option>
                    <option value="família">Família</option>
                    <option value="tributário">Tributário</option>
                    <option value="previdenciário">Previdenciário</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="text-sm font-bold dark:text-slate-300 block mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as CaseStatus,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-xl dark:text-white focus:ring-2 ring-primary-500"
                  >
                    {Object.values(CaseStatus).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="outcome"
                    className="text-sm font-bold dark:text-slate-300 block mb-1"
                  >
                    Resultado
                  </label>
                  <select
                    id="outcome"
                    value={formData.outcome}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        outcome: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-xl dark:text-white focus:ring-2 ring-primary-500"
                  >
                    <option value="em_andamento">Em Andamento</option>
                    <option value="ganho">Ganho / Procedente</option>
                    <option value="perdido">Perdido / Improcedente</option>
                    <option value="acordo">Acordo Celebrado</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="value"
                    className="text-sm font-bold dark:text-slate-300 block mb-1"
                  >
                    Valor da Causa (R$)
                  </label>
                  <input
                    id="value"
                    type="number"
                    placeholder="0.00"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-xl dark:text-white focus:ring-2 ring-primary-500"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <label
                htmlFor="tags-input"
                className="text-sm font-bold dark:text-slate-300 block flex items-center gap-2"
              >
                <Tag size={16} /> Tags (Máx 10 - Enter para adicionar)
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-navy-800 rounded-2xl border-2 border-transparent focus-within:border-primary-500 transition-all">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 animate-in zoom-in duration-200"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="tags-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1 bg-transparent border-none outline-none text-sm dark:text-white min-w-[150px]"
                  placeholder="Ex: urgente, liminar, contestação..."
                />
              </div>
            </section>

            <section className="space-y-1">
              <label
                htmlFor="notes"
                className="text-sm font-bold dark:text-slate-300 block"
              >
                Observações e Notas
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl dark:text-white resize-none focus:ring-2 ring-primary-500"
                placeholder="Insira detalhes relevantes sobre o andamento do processo..."
              />
            </section>
          </div>

          <div className="px-8 py-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex justify-end gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {initialData?.id ? 'Atualizar' : 'Cadastrar'} Processo
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
