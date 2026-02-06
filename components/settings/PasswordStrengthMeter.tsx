import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
}) => {
  const strength = useMemo(() => {
    if (!password)
      return {
        score: 0,
        label: 'Vazia',
        color: 'bg-slate-200',
        textColor: 'text-slate-400',
      };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const results = [
      {
        score: 0,
        label: 'Muito Fraca',
        color: 'bg-red-500',
        textColor: 'text-red-500',
      },
      {
        score: 1,
        label: 'Fraca',
        color: 'bg-orange-500',
        textColor: 'text-orange-500',
      },
      {
        score: 2,
        label: 'Média',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-500',
      },
      {
        score: 3,
        label: 'Forte',
        color: 'bg-green-500',
        textColor: 'text-green-500',
      },
      {
        score: 4,
        label: 'Muito Forte',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-500',
      },
    ];

    const idx = Math.min(score, 4);
    return results[idx];
  }, [password]);

  const requirements = [
    { label: '8+ caracteres', met: password.length >= 8 },
    { label: 'Letra Maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Número', met: /\d/.test(password) },
    { label: 'Caractere Especial', met: /[^a-zA-Z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          Força da Senha:{' '}
          <span className={strength.textColor}>{strength.label}</span>
        </span>
      </div>

      <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 transition-all duration-500 ${i < strength.score ? strength.color : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {requirements.map((req, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-tight transition-colors ${req.met ? 'text-green-600' : 'text-slate-400'}`}
          >
            {req.met ? <Check size={10} strokeWidth={4} /> : <X size={10} />}
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
};
