import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users2, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { useTeam } from '../../hooks/useQueries';

interface TeamWidgetProps {
  members?: any[];
}

export const TeamWidget: React.FC<TeamWidgetProps> = ({
  members: propMembers,
}) => {
  const navigate = useNavigate();
  const { data: teamData = [], isLoading } = useTeam();

  const members = propMembers || teamData;
  const activeMembers = members
    .filter((m) => m.status === 'ativo')
    .sort(
      (a, b) => (b.stats?.active_cases || 0) - (a.stats?.active_cases || 0)
    );

  return (
    <div className="glass-card rounded-3xl p-8 soft-shadow h-[340px] flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

      <header className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-primary-600 rounded-xl shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30">
            <Users2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold dark:text-white tracking-tight text-slate-800">
              Time Jurídico
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {isLoading ? '...' : `${activeMembers.length} ATIVOS`}
            </span>
          </div>
        </div>
        <Link
          to="/equipe"
          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-all active:scale-95"
        >
          <ExternalLink size={18} />
        </Link>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 -mr-2 relative z-10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-200" size={32} />
          </div>
        ) : activeMembers.length > 0 ? (
          activeMembers.slice(0, 5).map((m) => (
            <button
              key={m.id}
              onClick={() => navigate('/equipe')}
              className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all group/item text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden flex items-center justify-center border-2 border-white dark:border-white/15 shadow-sm group-hover/item:border-primary-100 dark:group-hover/item:border-primary-900/30 transition-colors">
                  {m.photo_url ? (
                    <img
                      src={m.photo_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      {m.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white leading-tight group-hover/item:text-primary-700 dark:group-hover/item:text-primary-400 transition-colors">
                    {m.name}
                  </p>
                  <span className="text-[10px] font-bold uppercase text-slate-400 group-hover/item:text-primary-500/70">
                    {m.role}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={14}
                className="text-slate-200 group-hover/item:text-primary-400 opacity-0 group-hover/item:opacity-100 transition-all transform group-hover/item:translate-x-0.5"
              />
            </button>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
            <p>Nenhum membro ativo.</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-white/[0.06] flex justify-center">
        <Link
          to="/equipe"
          className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest hover:gap-2 transition-all p-2"
        >
          Gerenciar Time <ChevronRight size={12} />
        </Link>
      </div>
    </div>
  );
};
