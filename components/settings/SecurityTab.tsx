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
import { settingsConfig } from '../../utils/settingsConfig';

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <section className={settingsConfig.cardClass + ' space-y-6'}>
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
            <Lock size={18} />
          </div>
          <div>
            <h3 className={settingsConfig.sectionTitleClass}>Segurança</h3>
            <p className={settingsConfig.sectionDescClass}>
              Gerencie sua senha e acesso à conta
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
          <div className="space-y-1">
            <label className={settingsConfig.labelClass}>Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className={settingsConfig.inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className={settingsConfig.labelClass}>Nova Senha</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className={settingsConfig.inputClass + ' pr-12'}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className={settingsConfig.labelClass}>
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords({ ...passwords, confirm: e.target.value })
              }
              className={settingsConfig.inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className={
              settingsConfig.buttonPrimaryClass + ' w-full justify-center'
            }
          >
            {isChanging ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            Alterar Senha
          </button>
        </form>
      </section>

      <section className="p-6 rounded-2xl border border-red-200 bg-red-50 space-y-4">
        <div className="flex items-center gap-3 text-red-600">
          <ShieldAlert size={20} />
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Zona de Perigo
          </h3>
        </div>
        <p className="text-sm text-red-600/80">
          Ações irreversíveis. Tenha cuidado.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-6 py-3 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
        >
          Excluir Conta
        </button>
      </section>
    </div>
  );
};
