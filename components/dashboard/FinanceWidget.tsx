
import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface FinanceWidgetProps {
  revenue: number;
  expense: number;
  mrr: number;
  defaultRate: number;
}

export const FinanceWidget: React.FC<FinanceWidgetProps> = ({ revenue, expense, mrr, defaultRate }) => {
  const balance = revenue - expense;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-[280px] flex flex-col relative group">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
            <DollarSign size={20} />
          </div>
          <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Resumo Financeiro</h3>
        </div>
        <Link to="/financeiro" className="text-slate-400 hover:text-primary-600 transition-colors">
          <ExternalLink size={18} />
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Receitas</p>
          <p className="text-lg font-black text-green-600 tabular-nums">{formatCurrency(revenue)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Despesas</p>
          <p className="text-lg font-black text-red-600 tabular-nums">{formatCurrency(expense)}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center border-t border-slate-100 dark:border-slate-800 pt-4">
        <div className="flex items-center justify-between">
           <div>
             <p className="text-[10px] font-bold text-slate-400 uppercase">Saldo do Mês</p>
             <div className="flex items-center gap-2">
               {balance >= 0 ? <ArrowUp size={16} className="text-green-500" /> : <ArrowDown size={16} className="text-red-500" />}
               <p className={`text-2xl font-black tabular-nums ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance)}
               </p>
             </div>
           </div>
           <div className="text-right space-y-1">
              <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-primary-600 rounded-md text-[9px] font-black uppercase">MRR: {formatCurrency(mrr)}</span>
              {defaultRate > 10 && <span className="block px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 rounded-md text-[9px] font-black uppercase">Inadimplência: {defaultRate.toFixed(1)}%</span>}
           </div>
        </div>
      </div>
    </div>
  );
};
