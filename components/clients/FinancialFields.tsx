
import React from 'react';
import { Smartphone, Building2, FileText, CreditCard, Banknote, Info } from 'lucide-react';

interface FinancialFieldsProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

export const FinancialFields: React.FC<FinancialFieldsProps> = ({ data, onChange }) => {
  return (
    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in fade-in duration-300">
      <h4 className="font-bold dark:text-white flex items-center gap-2">
        <CreditCard size={18} className="text-primary-500" />
        Configuração Financeira
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Forma de Pagamento</label>
          <select
            value={data.payment_method || 'PIX'}
            onChange={(e) => onChange('payment_method', e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
          >
            <option value="PIX">PIX</option>
            <option value="TED">TED / Transferência</option>
            <option value="Boleto">Boleto Bancário</option>
            <option value="Cartão">Cartão de Crédito</option>
            <option value="Dinheiro">Dinheiro</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Valor Hora / Consulta (R$)</label>
          <input
            type="number"
            value={data.hourly_rate || ''}
            onChange={(e) => onChange('hourly_rate', e.target.value)}
            placeholder="0,00"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Retainer Fee Mensal (R$)</label>
            <div title="Valor fixo mensal pago antecipadamente" className="text-slate-400 cursor-help">
              <Info size={14} />
            </div>
          </div>
          <input
            type="number"
            value={data.retainer_fee || ''}
            onChange={(e) => onChange('retainer_fee', e.target.value)}
            placeholder="0,00"
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Dia de Vencimento</label>
          <select
            value={data.billing_day || 10}
            onChange={(e) => onChange('billing_day', parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>

        <div className="col-span-full space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Observações Financeiras</label>
            <span className="text-[10px] text-slate-400">{(data.financial_notes || '').length}/200</span>
          </div>
          <textarea
            value={data.financial_notes || ''}
            onChange={(e) => onChange('financial_notes', e.target.value.slice(0, 200))}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none"
            placeholder="Condições especiais, descontos, etc..."
          />
        </div>
      </div>
    </div>
  );
};
