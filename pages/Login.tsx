import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, Scale } from 'lucide-react';
import { toast } from 'sonner';
import { getOffice } from '../utils/settingsPersistence';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [officeLogo, setOfficeLogo] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const office = getOffice();
    if (office?.logo_url) {
      setOfficeLogo(office.logo_url);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950 p-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {officeLogo ? (
            <img
              src={officeLogo}
              alt="Logo do Escritório"
              className="mx-auto h-24 w-auto mb-4 drop-shadow-xl animate-in zoom-in duration-500"
              onError={() => setOfficeLogo(null)}
            />
          ) : (
            <div className="mx-auto h-24 w-24 mb-4 rounded-2xl bg-primary-600/20 flex items-center justify-center animate-in zoom-in duration-500">
              <Scale size={40} className="text-primary-400" />
            </div>
          )}
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestão Jurídica Inteligente
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800/50 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl">
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
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-navy-800 border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:border-primary-500 rounded-xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all outline-none`}
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
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-navy-800 border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:border-primary-500 rounded-xl focus:ring-4 focus:ring-primary-500/10 dark:text-white transition-all outline-none`}
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
