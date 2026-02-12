import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatCPF } from '../../utils/formatters';

interface CPFCNPJInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isValid?: boolean;
}

export const CPFCNPJInput: React.FC<CPFCNPJInputProps> = ({
  value,
  onChange,
  error,
  isValid,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 14);
    onChange(rawValue);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <input
          type="text"
          value={formatCPF(value)}
          onChange={handleChange}
          maxLength={18}
          placeholder="000.000.000-00"
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-navy-800 border-none rounded-xl focus:ring-2 transition-all dark:text-white ${
            error ? 'ring-2 ring-red-500' : 'focus:ring-primary-500'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid && !error && (
            <CheckCircle2 className="text-green-500" size={18} />
          )}
          {error && <XCircle className="text-red-500" size={18} />}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
        CPF: 11 dígitos | CNPJ: 14 dígitos
      </p>
    </div>
  );
};
