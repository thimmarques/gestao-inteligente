import React from 'react';
import { Phone } from 'lucide-react';
import { formatPhone } from '../../utils/formatters';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
    onChange(rawValue);
  };

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <Phone
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={formatPhone(value)}
          onChange={handleChange}
          maxLength={15}
          placeholder="(00) 00000-0000"
          className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 transition-all dark:text-white ${
            error ? 'ring-2 ring-red-500' : 'focus:ring-primary-500'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
