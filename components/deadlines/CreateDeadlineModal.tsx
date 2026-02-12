import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Loader2,
  Calendar,
  AlertTriangle,
  AlertCircle,
  MinusCircle,
  Circle,
  Briefcase,
  Info,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Deadline, Case } from '../../types';
import { useDeadlines, useCases } from '../../hooks/useQueries';
import { useAuth } from '../../contexts/AuthContext';
import { deadlineService } from '../../services/deadlineService';

interface CreateDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  onSuccess?: () => void;
  defaultCaseId?: string;
  mode?: 'create' | 'edit';
  deadlineId?: string;
  initialData?: Deadline | null;
}

export const CreateDeadlineModal: React.FC<CreateDeadlineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSuccess,
  defaultCaseId,
  mode = 'create',
  initialData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { data: cases = [] } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCaseList, setShowCaseList] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    case_id: '',
    deadline_date: '',
    priority: 'média',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        deadline_date: initialData.deadline_date
          ? initialData.deadline_date.split('T')[0]
          : '',
      });
    } else {
      setFormData({
        title: '',
        case_id: defaultCaseId || '',
        deadline_date: new Date(Date.now() + 5 * 86400000)
          .toISOString()
          .split('T')[0],
        priority: 'média',
        description: '',
      });
    }
  }, [isOpen, initialData, defaultCaseId]);

  const selectedCase = cases.find((c: any) => c.id === formData.case_id);
  const filteredCases = (cases as any[]).filter(
    (c) =>
      c.process_number.includes(searchTerm) ||
      (c.court && c.court.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate case_id as it is required by schema
    if (!formData.case_id) {
      alert('Selecione um processo vinculado.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        await deadlineService.createDeadline({
          ...formData,
          lawyer_id: user.id,
          // case_id is inside formData and validated above
        });
      }
      if (onSuccess) onSuccess();

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { id: 'baixa', label: 'Baixa', icon: MinusCircle, color: 'text-slate-400' },
    { id: 'média', label: 'Média', icon: Circle, color: 'text-blue-500' },
    { id: 'alta', label: 'Alta', icon: AlertCircle, color: 'text-orange-500' },
    {
      id: 'urgente',
      label: 'Urgente',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
  ];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-800/50 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white">
              {mode === 'create' ? 'Novo Prazo' : 'Editar Prazo'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            Configure o prazo processual.
          </p>
        </div>

        <form
          id="create-deadline-form"
          onSubmit={handleSubmit}
          className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Título do Prazo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Contestação, Recurso"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Processo Vinculado
            </label>
            <input
              type="text"
              placeholder="Buscar processo..."
              value={
                searchTerm || (selectedCase ? selectedCase.process_number : '')
              }
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowCaseList(true);
              }}
              onFocus={() => setShowCaseList(true)}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono shadow-inner outline-none transition-all"
            />
            {showCaseList && searchTerm && filteredCases.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-top-2">
                {filteredCases.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, case_id: c.id });
                      setShowCaseList(false);
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-white/10 last:border-0"
                  >
                    <p className="text-sm font-bold dark:text-white font-mono">
                      {c.process_number}
                    </p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                      {c.court}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Data Limite
            </label>
            <input
              type="date"
              required
              value={formData.deadline_date}
              onChange={(e) =>
                setFormData({ ...formData, deadline_date: e.target.value })
              }
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm outline-none transition-all shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Prioridade
            </label>
            <div className="grid grid-cols-2 gap-3">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: opt.id })}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${formData.priority === opt.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-50 dark:border-white/10 hover:border-slate-200'}`}
                >
                  <opt.icon size={20} className={opt.color} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes adicionais..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-5 py-4 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner outline-none transition-all"
            />
          </div>
        </form>

        <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
          >
            Cancelar
          </button>
          <button
            form="create-deadline-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Salvar Prazo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
