import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../../services/inviteService';
import { toast } from 'sonner';
import { Mail, Plus, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

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
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-bold dark:text-white">
          Gerenciar Convites
        </h2>
        <p className="text-slate-500 text-sm">
          Convide novos membros para o seu escritório.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={handleInvite}
          className="flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Email do Convidado
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Perfil
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
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
            className="w-full md:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed h-[42px]"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Plus size={18} />
            )}
            Enviar Convite
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold dark:text-white">Convites Enviados</h3>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {invites.length}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="animate-spin m-auto mb-2" />
            Carregando...
          </div>
        ) : invites.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center m-auto mb-3 text-slate-400">
              <Mail size={24} />
            </div>
            <p>Nenhum convite enviado ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {invites.map((invite: any) => (
              <div
                key={invite.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      invite.status === 'accepted'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {invite.status === 'accepted' ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white text-sm">
                      {invite.email}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {invite.role} • Enviado em{' '}
                      {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
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
