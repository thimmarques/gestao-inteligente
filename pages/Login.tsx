import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl text-white font-bold text-3xl mb-4 shadow-xl shadow-primary-500/20">
            L
          </div>
          <h1 className="text-3xl font-bold dark:text-white">LegalTech</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestão Jurídica Inteligente
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:border-primary-500 rounded-xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all outline-none`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                <Link
                  to="/auth/reset"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:border-primary-500 rounded-xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all outline-none`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-70 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          LegalTech 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
