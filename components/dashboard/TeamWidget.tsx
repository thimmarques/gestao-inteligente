
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users2, ExternalLink, ChevronRight } from 'lucide-react';
import { TeamMember } from '../../types/team';

interface TeamWidgetProps {
  members: TeamMember[];
}

export const TeamWidget: React.FC<TeamWidgetProps> = ({ members }) => {
  const navigate = useNavigate();
  const activeMembers = members.filter(m => m.status === 'ativo').sort((a, b) => (b.stats?.active_cases || 0) - (a.stats?.active_cases || 0));
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm h-[320px] flex flex-col group">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary-600 rounded-xl">
            <Users2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Time Jurídico</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeMembers.length} ATIVOS</span>
          </div>
        </div>
        <Link to="/equipe" className="text-slate-400 hover:text-primary-600 transition-colors">
          <ExternalLink size={18} />
        </Link>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {activeMembers.slice(0, 5).map((m) => (
          <button 
            key={m.id} 
            onClick={() => navigate('/equipe')}
            className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
          >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                   {m.photo_url ? <img src={m.photo_url} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-400">{m.name[0]}</span>}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold dark:text-white leading-tight">{m.name}</p>
                  <span className="text-[10px] font-black uppercase text-primary-600">{m.role}</span>
                </div>
             </div>
             <ChevronRight size={14} className="text-slate-200 group-hover:text-primary-500" />
          </button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
         <Link to="/equipe" className="flex items-center gap-1 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:gap-2 transition-all">
           Gerenciar Time <ChevronRight size={12} />
         </Link>
      </div>
    </div>
  );
};
