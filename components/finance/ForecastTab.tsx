
import React, { useState, useMemo } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, AlertTriangle, ShieldCheck, Edit, ExternalLink, Loader2 } from 'lucide-react';
import { FinanceRecord, Client, ForecastMonth } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { calculateForecast } from '../../utils/financialForecast';
import { ForecastChart } from './ForecastChart';

interface ForecastTabProps {
  revenues: FinanceRecord[];
  expenses: FinanceRecord[];
}

export const ForecastTab: React.FC<ForecastTabProps> = ({ revenues, expenses }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const forecastData = useMemo(() => {
    const clients = JSON.parse(localStorage.getItem('legalflow_clients') || '[]');
    return calculateForecast(revenues, expenses, clients);
  }, [revenues, expenses, lastUpdate]);

  const totals = useMemo(() => ({
    revenue: forecastData.reduce((sum, f) => sum + f.projected_revenue, 0),
    expense: forecastData.reduce((sum, f) => sum + f.projected_expenses, 0),
    balance: forecastData.reduce((sum, f) => sum + f.projected_balance, 0),
  }), [forecastData]);

  const handleRefresh = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsUpdating(false);
    }, 1200);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black dark:text-white tracking-tight">Previsão Financeira</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próximos 6 meses</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] text-slate-400 font-medium">Última atualização: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isUpdating}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw size={16} className={isUpdating ? 'animate-spin text-primary-500' : ''} />
          {isUpdating ? 'Recalculando Projeções...' : 'Atualizar Dados'}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-primary-600 rounded-2xl"><TrendingUp size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faturamento Projetado</span>
          </div>
          <p className="text-3xl font-black dark:text-white tracking-tighter tabular-nums">{formatCurrency(totals.revenue)}</p>
          <p className="text-[10px] font-bold text-primary-500 uppercase mt-2 tracking-widest">Acumulado semestre</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><TrendingDown size={24} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gastos Estimados</span>
          </div>
          <p className="text-3xl font-black dark:text-white tracking-tighter tabular-nums">{formatCurrency(totals.expense)}</p>
          <p className="text-[10px] font-bold text-red-500 uppercase mt-2 tracking-widest">Média variável inclusa</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-xl transition-all ${
          totals.balance >= 0 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-green-500/20' 
            : 'bg-gradient-to-br from-red-500 to-orange-600 border-red-400 text-white shadow-red-500/20'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              {totals.balance >= 0 ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Saldo Acumulado</span>
          </div>
          <p className="text-3xl font-black tracking-tighter tabular-nums">{formatCurrency(totals.balance)}</p>
          <p className="text-[10px] font-bold uppercase mt-2 tracking-widest opacity-90">
            Saúde financeira: {totals.balance >= 0 ? 'POSITIVA' : 'ATENÇÃO'}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold dark:text-white mb-8 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary-600 rounded-full" />
          Projeção Visual de Fluxo de Caixa
        </h3>
        <div className="h-[400px]">
          <ForecastChart forecastData={forecastData} />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-sm font-bold dark:text-white uppercase tracking-widest">Cronograma de Resultados Mensais</h3>
           <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500">PROJEÇÃO ALGORÍTMICA</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Projetada</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Despesa Projetada</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Mensal</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Confiança</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {forecastData.map((f, i) => (
                <tr key={i} className={`hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors ${f.projected_balance < 0 ? 'bg-red-500/5' : ''}`}>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold dark:text-slate-200 capitalize">{f.month}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-green-600 dark:text-green-400">{formatCurrency(f.projected_revenue)}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Recorrente: {formatCurrency(f.recurring_revenue)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-red-500 tabular-nums">
                    {formatCurrency(f.projected_expenses)}
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       {f.projected_balance >= 0 ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                       <span className={`text-base font-black tabular-nums ${f.projected_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(f.projected_balance)}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="group relative cursor-help">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit border ${
                        f.confidence === 'alta' ? 'bg-green-100 text-green-700 border-green-200' : 
                        f.confidence === 'média' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {f.confidence === 'alta' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                        {f.confidence}
                      </span>
                      <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed shadow-2xl">
                        Nível calculado com base na proporção de receita recorrente contratual sobre o total.
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => alert("Ajuste manual virá no modal AdjustForecastModal")} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                      <Edit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-950 text-white font-black uppercase tracking-widest text-[10px]">
              <tr>
                <td className="px-8 py-6 rounded-bl-[2.5rem]">Totais Projetados</td>
                <td className="px-6 py-6 text-green-400">{formatCurrency(totals.revenue)}</td>
                <td className="px-6 py-6 text-red-400">{formatCurrency(totals.expense)}</td>
                <td className="px-6 py-6 text-lg tracking-tighter" colSpan={2}>Saldo Acumulado: {formatCurrency(totals.balance)}</td>
                <td className="px-8 py-6 text-right rounded-br-[2.5rem]">
                   <ExternalLink size={18} className="ml-auto opacity-40" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
