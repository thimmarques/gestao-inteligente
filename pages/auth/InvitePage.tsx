import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { inviteService } from '../../services/inviteService';
import { toast } from 'sonner';
import { Loader2, CheckCircle, Lock, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const inviteSchema = z.object({
    fullName: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export const InvitePage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema)
    });

    useEffect(() => {
        if (!token) {
            toast.error('Token de convite inválido ou ausente.');
            setIsValidToken(false);
        } else {
            setIsValidToken(true); // Na prática, poderíamos validar o token aqui chamando uma function, mas o submit valida também.
        }
    }, [token]);

    const onSubmit = async (data: InviteFormValues) => {
        if (!token) return;
        setIsSubmitting(true);
        try {
            await inviteService.acceptInvite(token, data.password, data.fullName);
            toast.success('Conta criada com sucesso! Redirecionando...');

            // Auto login (se a Edge Function retornasse session seria melhor, mas aqui fazemos login manual ou mandamos pra login)
            // Como a edge function cria o user, podemos tentar logar direto:
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: '...', // Não temos o email aqui fácil sem consultar o token, então mandamos pro login
                password: data.password
            });

            // Melhor mandar para o login para garantir fluxo limpo
            setTimeout(() => navigate('/'), 2000);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Erro ao aceitar convite.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isValidToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl max-w-md">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Link Inválido</h2>
                    <p className="text-slate-500">Este link de convite não existe ou expirou.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 space-y-8 animate-in fade-in zoom-in duration-300">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold dark:text-white">Aceitar Convite</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Crie sua conta para acessar o sistema.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('fullName')}
                                type="text"
                                placeholder="Seu nome"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Defina uma Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirme a Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Criar Conta'}
                    </button>
                </form>
            </div>
        </div>
    );
};
