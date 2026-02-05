import React, { useState, useEffect } from "react";
import { X, Save, Lock, Clock, AlertTriangle } from "lucide-react";

interface AddDeadlineModalProps {
  caseId: string;
  processNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({
  caseId,
  processNumber,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    deadline_date: "",
    priority: "média",
    description: "",
  });

  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (formData.deadline_date) {
      const diff = Math.ceil(
        (new Date(formData.deadline_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );
      setDaysRemaining(diff);
    } else {
      setDaysRemaining(null);
    }
  }, [formData.deadline_date]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newDeadline = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      case_id: caseId,
      status: "pendente",
      created_at: new Date().toISOString(),
    };

    const existing = JSON.parse(
      localStorage.getItem("legaltech_deadlines") || "[]",
    );
    localStorage.setItem(
      "legaltech_deadlines",
      JSON.stringify([...existing, newDeadline]),
    );

    // Simulate toast
    alert("Prazo adicionado com sucesso!");
    onClose();
    window.location.reload(); // Quick refresh to update state in parent
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold dark:text-white">Adicionar Prazo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Processo Relacionado
            </label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-500 cursor-not-allowed">
              <Lock size={14} />
              <span className="text-sm font-mono font-bold">
                {processNumber}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Título do Prazo*
            </label>
            <input
              required
              type="text"
              placeholder="Ex: Protocolar Recurso"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Data Limite*
              </label>
              <input
                required
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                value={formData.deadline_date}
                onChange={(e) =>
                  setFormData({ ...formData, deadline_date: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                Prioridade*
              </label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="baixa">Baixa</option>
                <option value="média">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          {daysRemaining !== null && (
            <div
              className={`p-3 rounded-xl flex items-center gap-3 border ${
                daysRemaining < 0
                  ? "bg-red-50 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-900/30"
                  : daysRemaining <= 3
                    ? "bg-orange-50 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-900/30"
                    : "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/10 dark:border-blue-900/30"
              }`}
            >
              <Clock size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {daysRemaining < 0
                  ? `Vencido há ${Math.abs(daysRemaining)} dias`
                  : daysRemaining === 0
                    ? "Vence HOJE"
                    : `Faltam ${daysRemaining} dias`}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Descrição / Observações
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes adicionais sobre o prazo..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all"
            >
              <Save size={16} />
              Salvar Prazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
