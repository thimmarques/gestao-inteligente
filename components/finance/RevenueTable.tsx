
import React from 'react';
import { MoreVertical, CheckCircle2, Eye, Edit, Trash2, User, Briefcase } from 'lucide-react';
import { FinanceRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RevenueTableProps {
  revenues: FinanceRecord[];
  onQuickPayment: (record: FinanceRecord) => void;
  onEdit: (record: FinanceRecord) => void;
  onDelete: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  'Honorários Contratuais': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Honorários de Êxito': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Consultas Avulsas': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Retainer Fee (Mensalidade)': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Outros': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

export const RevenueTable: React.FC<RevenueTableProps> = ({ 
  revenues, onQuickPayment, onEdit, onDelete 
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente / Processo</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagamento</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {revenues.length === 0 ? (
              <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Nenhuma receita encontrada</td></tr>
            ) : (
              revenues.map((r) => {
                const isVencido = r.status === 'vencido' || (r.status === 'pendente' && new Date(r.due_date) < new Date());
                
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700">
                            <User size={12} />
                          </div>
                          <span className="text-sm font-bold dark:text-white truncate max-w-[180px]">{r.client?.name || 'N/A'}</span>
                        </div>
                        {r.case && (
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 dark:text-primary-400 pl-8">
                            <Briefcase size={10} /> {r.case.process_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${categoryColors[r.category] || categoryColors['Outros']}`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-base font-black dark:text-white tabular-nums">{formatCurrency(r.amount)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-sm font-bold tabular-nums ${isVencido ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
                        {formatDate(r.due_date)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {r.paid_date ? (
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">{formatDate(r.paid_date)}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{r.payment_method}</p>
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">---</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        r.status === 'pago' ? 'bg-green-100 text-green-700' : 
                        r.status === 'vencido' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {r.status !== 'pago' && (
                          <button 
                            onClick={() => onQuickPayment(r)}
                            className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white rounded-xl transition-all"
                            title="Registrar Pagamento"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        )}
                        <button onClick={() => onEdit(r)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary-600 rounded-xl transition-all shadow-sm"><Edit size={16} /></button>
                        <button onClick={() => onDelete(r.id)} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
