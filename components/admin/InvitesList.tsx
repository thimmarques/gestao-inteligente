import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inviteService } from '../../services/inviteService';
import { toast } from 'sonner';
import { Mail, Copy, Loader2, Plus } from 'lucide-react';

export const InvitesList: React.FC = () => {
    const queryClient = useQueryClient();
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState('lawyer');
    const [isCreating, setIsCreating] = useState(false);

    const { data: invites = [], isLoading } = useQuery({
        queryKey: ['invites'],
        queryFn: inviteService.listInvites
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            return await inviteService.createInvite(newEmail, newRole);
        },
        onSuccess: () => {
            toast.success('Convite criado com sucesso!');
            setNewEmail('');
            queryClient.invalidateQueries({ queryKey: ['invites'] });
            setIsCreating(false);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Erro ao criar convite');
            setIsCreating(false);
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        setIsCreating(true);
        createMutation.mutate();
    };

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser());
            if (!user) return null;
            const { data } = await import('../../lib/supabase').then(m => m.supabase.from('profiles').select('office_id').eq('id', user.id).single());
            return data;
        }
    });

    const copyLink = (token: string) => {
        const link = `${window.location.origin}/auth/invite?token=${token}`;
        navigator.clipboard.writeText(link);
        toast.success('Link copiado!');
    };

    if (isLoadingProfile) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin m-auto text-slate-400" /></div>;
    }

    if (profile && !profile.office_id) {
        return (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                <h3 className="font-bold mb-2">Configuração Pendente</h3>
                <p className="mb-4">Seu usuário não está vinculado a um escritório. Por favor, complete o cadastro.</p>
                <a
                    href="/settings"
                    className="inline-block px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium transition-colors"
                >
                    Ir para Configurações
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Convidar Novo Membro</h3>
                <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="Email do convidade"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                        />
                    </div>
                    <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                    >
                        <option value="lawyer">Advogado</option>
                        <option value="assistant">Assistente</option>
                        <option value="intern">Estagiário</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                    >
                        {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                        Convidar
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold dark:text-white">Convites Enviados</h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center"><Loader2 className="animate-spin m-auto text-primary-500" /></div>
                ) : invites.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Nenhum convite enviado.</div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {invites.map((invite: any) => (
                            <div key={invite.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div>
                                    <p className="font-bold dark:text-white text-sm">{invite.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 capitalize">{invite.role}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-md ${invite.accepted_at ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {invite.accepted_at ? 'Aceito' : 'Pendente'}
                                        </span>
                                    </div>
                                </div>
                                {!invite.accepted_at && (
                                    <button
                                        onClick={() => copyLink(invite.token)}
                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        title="Copiar Link"
                                    >
                                        <Copy size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
