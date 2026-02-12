import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Mail,
  MessageSquare,
  Loader2,
  Check,
  Shield,
} from 'lucide-react';
import { TeamMember } from '../../types/team';

interface AssignCaseModalProps {
  caseIds: string[];
  currentLawyerId?: string;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (lawyerId: string, notify: boolean, message: string) => void;
}

export const AssignCaseModal: React.FC<AssignCaseModalProps> = ({
  caseIds,
  currentLawyerId,
  isOpen,
  onClose,
  onAssign,
}) => {
  const [lawyers, setLawyers] = useState<TeamMember[]>([]);
  const [selectedLawyerId, setSelectedLawyerId] = useState(
    currentLawyerId || ''
  );
  const [notify, setNotify] = useState(true);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Buscar membros do escritório que podem receber processos
    const team = JSON.parse(localStorage.getItem('legalflow_team') || '[]');
    setLawyers(
      team.filter((m: any) => m.role !== 'assistente' && m.status === 'ativo')
    );
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLawyer = lawyers.find((l) => l.id === currentLawyerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLawyerId) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    onAssign(selectedLawyerId, notify, message);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-800/50 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold dark:text-white tracking-tight">
              Atribuir Processo
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            {caseIds.length} processo(s) selecionado(s)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {currentLawyer && (
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                {currentLawyer.photo_url ? (
                  <img
                    src={currentLawyer.photo_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">
                    {currentLawyer.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Atribuído atualmente a:
                </p>
                <p className="text-sm font-bold dark:text-white leading-tight">
                  {currentLawyer.name}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Atribuir para*
            </label>
            <select
              required
              value={selectedLawyerId}
              onChange={(e) => setSelectedLawyerId(e.target.value)}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
            >
              <option value="">Selecione o advogado...</option>
              {lawyers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.oab ? `(OAB/${l.oab})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm font-bold dark:text-slate-300">
                  Notificar Advogado
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotify(!notify)}
                className={`w-12 h-6 rounded-full transition-all relative ${notify ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${notify ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>

            {notify && (
              <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex justify-between">
                  Mensagem / Instruções
                  <span>{message.length}/200</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Favor priorizar este protocolo..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !selectedLawyerId}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Check size={20} strokeWidth={3} />
              )}
              Confirmar Atribuição
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
