
import React, { useState } from 'react';
import { 
  X, Mail, Phone, ExternalLink, Shield, 
  Briefcase, User, Edit, Trash2, Calendar, 
  TrendingUp, CheckCircle2, Clock, Crown, 
  Instagram, Linkedin, Copy, ShieldCheck
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TeamMember } from '../../types/team';

interface TeamMemberDetailsModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (member: TeamMember) => void;
  onDelete?: (id: string) => void;
  currentUserId: string;
}

export const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({
  member, isOpen, onClose, onEdit, onDelete, currentUserId
}) => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'processos' | 'produtividade' | 'permissoes'>('perfil');

  if (!isOpen || !member) return null;

  const isMe = member.id === currentUserId;
  const normalizedRole = member.role.toLowerCase();
  const isAdmin = normalizedRole === 'admin';
  const isAdvogado = normalizedRole === 'advogado' || normalizedRole === 'lawyer';

  const handleDelete = () => {
    if (isMe) {
      alert("Você não pode excluir seu próprio perfil administrativo.");
      return;
    }
    if (confirm(`Remover permanentemente ${member.name} da equipe?`)) {
      onDelete?.(member.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        
        <div className="p-10 flex flex-col md:flex-row items-center gap-10 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
             <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center group">
               {member.photo_url ? (
                 <img src={member.photo_url} className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl font-black text-slate-300 uppercase">{member.name[0]}</span>
               )}
             </div>
             <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg ${
               isAdmin ? 'bg-purple-600' : isAdvogado ? 'bg-blue-600' : 'bg-green-600'
             } text-white`}>
               {isAdmin ? <Crown size={20} /> : isAdvogado ? <Briefcase size={20} /> : <User size={20} />}
             </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-3xl font-black dark:text-white tracking-tight">{member.name}</h2>
              {isMe && <span className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">VOCÊ</span>}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                 member.status === 'ativo' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-100 text-slate-500'
               }`}>
                 {member.status}
               </span>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">OAB/{member.oab || '---'}</p>
            </div>
          </div>

          <div className="flex gap-3">
             <button onClick={() => onEdit(member)} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-primary-600 hover:text-white transition-all shadow-sm">
               <Edit size={24} />
             </button>
             {!isMe && (
               <button onClick={handleDelete} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                 <Trash2 size={24} />
               </button>
             )}
             <button onClick={onClose} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 rounded-full transition-all">
               <X size={24} />
             </button>
          </div>
        </div>

        <div className="px-10 border-b border-slate-100 dark:border-slate-800 flex items-center gap-10 overflow-x-auto shrink-0 scrollbar-hide">
          {['Perfil', 'Permissões', 'Estatísticas'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'Permissões' ? 'permissoes' : tab === 'Estatísticas' ? 'produtividade' : 'perfil')}
              className={`flex items-center gap-2 py-6 text-xs font-black uppercase tracking-[0.2em] border-b-4 transition-all ${
                (activeTab === 'perfil' && tab === 'Perfil') || 
                (activeTab === 'permissoes' && tab === 'Permissões') ||
                (activeTab === 'produtividade' && tab === 'Estatísticas')
                  ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/20 dark:bg-slate-950/20">
           <div className="animate-in fade-in duration-500">
             {activeTab === 'perfil' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <User size={14} className="text-primary-600" /> Contato Profissional
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">E-mail</p>
                        <p className="text-sm font-bold dark:text-white">{member.email}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p>
                        <p className="text-sm font-bold dark:text-white">{member.phone}</p>
                      </div>
                    </div>
                 </section>

                 <section className="bg-primary-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-primary-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-[5rem] -mr-12 -mt-12" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8">Resumo de Atividades</h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-2xl font-black tabular-nums">{member.stats?.active_cases || 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Casos Ativos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-black tabular-nums">{member.stats?.success_rate || 0}%</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Taxa de Êxito</p>
                      </div>
                    </div>
                 </section>
               </div>
             )}

             {activeTab === 'permissoes' && (
               <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Controle de Privilégios</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(member.permissions).map(([key, value]) => (
                      <div key={key} className={`p-4 rounded-2xl border flex items-center justify-between ${value ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700 opacity-50'}`}>
                        <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-300">{key.replace('can_', '').replace(/_/g, ' ')}</span>
                        {value ? <ShieldCheck size={16} className="text-green-600" /> : <X size={16} className="text-slate-400" />}
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {activeTab === 'produtividade' && (
                <div className="py-20 text-center text-slate-400 italic">
                   <TrendingUp size={48} className="mx-auto opacity-20 mb-4" />
                   <p>Gráficos de produtividade individual serão reconciliados no próximo fechamento.</p>
                </div>
             )}
           </div>
        </div>

        <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-end">
           <button onClick={onClose} className="px-10 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Fechar Painel</button>
        </div>
      </div>
    </div>
  );
};
