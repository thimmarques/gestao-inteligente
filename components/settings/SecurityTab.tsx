import React, { useState, useMemo } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  LogOut,
  Check,
  X,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChanging(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPasswords({ current: '', new: '', confirm: '' });
    setIsChanging(false);
    alert('Senha alterada!');
  };

  const handleDeleteAccount = () => {
    const confirmText = prompt('Digite DELETE para confirmar:');
    if (confirmText === 'DELETE') {
      localStorage.clear();
      window.location.href = '/#/login';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
            <Lock size={20} />
          </div>
          <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
            Segurança (Campos Opcionais)
          </h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Senha Atual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 text-sm shadow-inner dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className="flex items-center justify-center gap-2 px-10 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
          >
            {isChanging ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Check size={18} />
            )}
            Alterar Senha
          </button>
        </form>
      </section>

      <section className="p-10 rounded-[3rem] border-2 border-red-500/20 bg-red-500/5 space-y-10">
        <div className="flex items-center gap-3 text-red-600">
          <ShieldAlert size={24} />
          <h3 className="text-sm font-black uppercase tracking-widest">
            Zona de Perigo
          </h3>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="px-10 py-4 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all"
        >
          Excluir Conta
        </button>
      </section>
    </div>
  );
};
