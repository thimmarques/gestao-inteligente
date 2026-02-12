import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../../services/inviteService';
import { toast } from 'sonner';
import { Mail, Plus, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { settingsConfig } from '../../utils/settingsConfig';

export const SettingsInvites: React.FC = () => {
  const { lawyer: currentUser } = useApp();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('lawyer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: inviteService.listInvites,
    enabled: !!currentUser?.office_id,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      return await inviteService.createInvite(email, role);
    },
    onSuccess: () => {
      toast.success(`Convite enviado para ${email}`);
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || 'Erro ao enviar convite');
      setIsSubmitting(false);
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    inviteMutation.mutate();
  };

  const isLawyer = currentUser?.role === 'lawyer';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-bold dark:text-white">
          Gerenciar Convites
        </h2>
        <p className="text-slate-500 text-sm">
          Convide novos membros para o seu escritório.
        </p>
      </div>

      <div className={settingsConfig.cardClass + ' space-y-4'}>
        <form
          onSubmit={handleInvite}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full space-y-1">
            <label className={settingsConfig.labelClass}>
              Email do Convidado
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={settingsConfig.inputClass + ' pl-10'}
                required
              />
            </div>
          </div>

          <div className="w-full md:w-48 space-y-1">
            <label className={settingsConfig.labelClass}>Perfil</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={settingsConfig.inputClass}
            >
              {!isLawyer && <option value="admin">Administrador</option>}
              {!isLawyer && <option value="lawyer">Advogado</option>}
              <option value="assistant">Assistente</option>
              <option value="intern">Estagiário</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={settingsConfig.buttonPrimaryClass + ' h-[42px]'}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Plus size={16} />
            )}
            Enviar Convite
          </button>
        </form>
      </div>

      <div className={settingsConfig.cardClass + ' p-0 overflow-hidden'}>
        <div className="p-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-sm font-bold dark:text-white">
            Convites Enviados
          </h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
            {invites.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-slate-400">
            <Loader2 className="animate-spin m-auto mb-2" size={20} />
            <p className="text-xs font-medium">Carregando...</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <div className="w-10 h-10 bg-slate-100 dark:bg-navy-800 rounded-full flex items-center justify-center m-auto mb-3 text-slate-400">
              <Mail size={20} />
            </div>
            <p className="text-sm">Nenhum convite enviado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
            {invites.map((invite: any) => (
              <div
                key={invite.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      invite.status === 'accepted'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {invite.status === 'accepted' ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white text-sm">
                      {invite.email}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {invite.role} •{' '}
                      {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      invite.status === 'accepted'
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}
                  >
                    {invite.status === 'accepted' ? 'Aceito' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
