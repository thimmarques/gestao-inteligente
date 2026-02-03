
import React from 'react';
import { Mail, Phone, ExternalLink, UserPlus, Shield, FileSignature, HandHeart } from 'lucide-react';
import { Client, ClientType } from '../../types';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { generateProcuracaoPDF, generateDeclaracaoHipossuficienciaPDF } from '../../utils/generateLegalDocuments';
import { useApp } from '../../gestao-inteligente/contexts/AppContext';

interface ClientCardProps {
  client: Client;
  onClick: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const { lawyer, office } = useApp();

  const handleProcuracao = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateProcuracaoPDF({ client, lawyer, office });
  };

  const handleDeclaracao = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateDeclaracaoHipossuficienciaPDF({ client, lawyer, office });
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col items-center text-center ${client.status === 'inativo' ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative w-24 h-24 mb-4">
        <div className="w-full h-full rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-primary-600 border-4 border-white dark:border-slate-900 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
          {client.photo_url ? <img src={client.photo_url} alt="" /> : client.name.charAt(0).toUpperCase()}
        </div>
        <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${client.status === 'ativo' ? 'bg-green-500' : 'bg-slate-400'}`} />
      </div>

      <h3 className="text-lg font-bold dark:text-white truncate w-full px-2 mb-1 group-hover:text-primary-600 transition-colors">
        {client.name}
      </h3>

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 mb-4 ${client.type === ClientType.PARTICULAR
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
        {client.type === ClientType.PARTICULAR ? <UserPlus size={10} /> : <Shield size={10} />}
        {client.type}
      </span>

      <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4" />

      <div className="w-full space-y-3 mb-6">
        <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="font-mono text-xs">{formatCPF(client.cpf_cnpj)}</span>
        </div>

        <div className="flex flex-col gap-2">
          {client.email && (
            <div className="flex items-center gap-2 text-sm text-slate-500 truncate px-4">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-bold justify-center">
            <Phone size={14} className="text-primary-500" />
            {formatPhone(client.phone)}
          </div>
        </div>
      </div>

      <div className="mt-auto w-full pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleProcuracao}
            className="py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-xl text-[9px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 hover:bg-indigo-600 hover:text-white transition-all"
          >
            <FileSignature size={14} />
            Procuração
          </button>
          <button
            onClick={handleDeclaracao}
            className="py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 rounded-xl text-[9px] font-black uppercase tracking-tighter flex items-center justify-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-all"
          >
            <HandHeart size={14} />
            Declaração
          </button>
        </div>

        <button className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all active:scale-95 group-hover:shadow-lg">
          Ver Detalhes
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};
