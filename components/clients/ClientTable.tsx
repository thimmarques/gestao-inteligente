
import React from 'react';
import { MoreVertical, Edit, Power, Trash2, UserPlus, Shield, FileSignature, HandHeart } from 'lucide-react';
import { Client, ClientType } from '../../types';
import { formatCPF, formatPhone } from '../../utils/formatters';
import { generateProcuracaoPDF, generateDeclaracaoHipossuficienciaPDF } from '../../utils/generateLegalDocuments';
import { useApp } from '../../gestao-inteligente/contexts/AppContext';

interface ClientTableProps {
  clients: Client[];
  onRowClick: (clientId: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients, onRowClick, onEdit, onDelete, onToggleStatus
}) => {
  const { lawyer, office } = useApp();

  const handleProcuracao = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    generateProcuracaoPDF({ client, lawyer, office });
  };

  const handleDeclaracao = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    generateDeclaracaoHipossuficienciaPDF({ client, lawyer, office });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input type="checkbox" className="rounded border-slate-300 dark:bg-slate-800 accent-primary-600" />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Nome / Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Documento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Contato</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Processos</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-20 text-center text-slate-500 font-medium">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr
                  key={client.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group ${client.status === 'inativo' ? 'opacity-60' : ''}`}
                  onClick={() => onRowClick(client.id)}
                >
                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300 dark:bg-slate-800 accent-primary-600" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        {client.photo_url ? <img src={client.photo_url} alt="" /> : client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm dark:text-white group-hover:text-primary-600 transition-colors">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase inline-flex items-center gap-1 ${client.type === ClientType.PARTICULAR
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                      {client.type === ClientType.PARTICULAR ? <UserPlus size={10} /> : <Shield size={10} />}
                      {client.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {formatCPF(client.cpf_cnpj)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-slate-300">{formatPhone(client.phone)}</span>
                      <span className="text-xs text-slate-500 truncate max-w-[150px]">{client.email || '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${client.status === 'ativo' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                      {client.process_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => handleProcuracao(e, client)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all" title="Gerar Procuração">
                        <FileSignature size={16} />
                      </button>
                      <button onClick={(e) => handleDeclaracao(e, client)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="Declaração de Hipossuficiência">
                        <HandHeart size={16} />
                      </button>
                      <button onClick={() => onEdit(client)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all" title="Editar">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => onToggleStatus(client)} className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all" title={client.status === 'ativo' ? 'Inativar' : 'Ativar'}>
                        <Power size={16} />
                      </button>
                      <button onClick={() => onDelete(client)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Deletar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
