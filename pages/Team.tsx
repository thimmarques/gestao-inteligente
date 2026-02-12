import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Link as LinkIcon,
  ChevronRight,
  RefreshCw,
  Users,
  Check,
} from 'lucide-react'; // Changed icons
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import { TeamMember } from '../types/team';
import { TeamMemberCard } from '../components/team/TeamMemberCard';
import { TeamMemberTable } from '../components/team/TeamMemberTable';
import { TeamViewToggle } from '../components/team/TeamViewToggle';
import { TeamFilters } from '../components/team/TeamFilters';
import { TeamMemberDetailsModal } from '../components/team/TeamMemberDetailsModal';
import { useAuth } from '../contexts/AuthContext';
import { inviteService } from '../services/inviteService';
import { useTeam } from '../hooks/useQueries';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner'; // Added toast

const PendingInvitesList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: invites = [] as any[], isLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: () => inviteService.listInvites(),
    enabled: !!currentUser?.office_id,
  });

  const pendingInvites = invites.filter(
    (i: any) => i.status === 'pending' || i.status === 'sent'
  );

  if (isLoading)
    return (
      <div className="animate-pulse h-20 bg-slate-100 dark:bg-navy-800 rounded-2xl" />
    );
  if (pendingInvites.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="bg-white dark:bg-navy-800/50 p-6 rounded-2xl border border-dotted border-slate-300 dark:border-white/15 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-bold text-sm dark:text-white">{invite.email}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {invite.role} • Enviado em{' '}
              {new Date(invite.created_at).toLocaleDateString()}
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest rounded-full">
            Pendente
          </span>
        </div>
      ))}
    </div>
  );
};

const Team: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(
    () => (localStorage.getItem('team_view') as any) || 'cards'
  );
  const [activeTab, setActiveTab] = useState<
    'todos' | 'admin' | 'lawyer' | 'assistant'
  >('todos');
  const [filterState, setFilterState] = useState({
    search: '',
    roles: [],
    status: 'todos',
    sort: 'name_asc',
  });
  // Removed isAddModalOpen state
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const { data: teamMembers = [], isLoading, refetch } = useTeam();
  const [copied, setCopied] = useState(false); // State for copy feedback

  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter((m: any) => {
        const matchSearch =
          m.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
          m.email.toLowerCase().includes(filterState.search.toLowerCase());

        const matchTab = activeTab === 'todos' || m.role === activeTab;
        const matchRoles =
          filterState.roles.length === 0 || filterState.roles.includes(m.role);
        const matchStatus =
          filterState.status === 'todos' || m.status === filterState.status;

        return matchSearch && matchTab && matchRoles && matchStatus;
      })
      .sort((a: any, b: any) => {
        if (filterState.sort === 'name_asc')
          return a.name.localeCompare(b.name);
        if (filterState.sort === 'cases_desc')
          return (b.stats?.active_cases || 0) - (a.stats?.active_cases || 0);
        return 0;
      });
  }, [teamMembers, filterState, activeTab]);

  const handleDeleteMember = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    refetch();
    setSelectedMember(null);
  };

  const isStaff =
    (currentUser?.role as any) === Role.ASSISTANT ||
    (currentUser?.role as any) === Role.INTERN ||
    (currentUser?.role as any) === 'assistant' ||
    (currentUser?.role as any) === 'intern' ||
    (currentUser?.role as any) === 'assistente' ||
    (currentUser?.role as any) === 'estagiario';

  const [inviteRole, setInviteRole] = useState<
    'lawyer' | 'assistant' | 'intern'
  >('lawyer');

  const handleCopyInviteLink = async () => {
    const secret = import.meta.env.VITE_SIGNUP_SECRET;
    if (!secret) {
      toast.error(
        'Erro de configuração: VITE_SIGNUP_SECRET não definido no .env',
        {
          description: 'Avise o administrador para configurar a chave secreta.',
        }
      );
      return;
    }

    // Construct the link with office_id and role
    const officeId = currentUser?.office_id;
    if (!officeId) {
      toast.error('Erro: Seu usuário não está vinculado a um escritório.');
      return;
    }

    const link = `${window.location.origin}/auth/signup?secret=${secret}&ref=${officeId}&role=${inviteRole}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
          throw new Error('Fallback copy failed');
        }
        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success('Link copiado!', {
        description: `Link para ${inviteRole === 'lawyer' ? 'Advogado' : inviteRole === 'assistant' ? 'Assistente' : 'Estagiário'} copiado.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
      toast.error('Erro ao copiar', {
        description: 'Copie manualmente: ' + link,
        duration: 10000,
      });
      // Optional: Alert the link if toast fails or for immediate visibility
      // window.prompt("Copie o link abaixo:", link);
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-navy-950 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <span>Escritório</span>
            <ChevronRight size={10} />
            <span className="text-primary-600">Equipe</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight">
            Time do Escritório
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!isStaff && (
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="h-[56px] px-4 bg-white dark:bg-navy-800/50 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="lawyer">Advogado</option>
              <option value="assistant">Assistente</option>
              <option value="intern">Estagiário</option>
            </select>
          )}

          <div className="relative group">
            <button
              onClick={handleCopyInviteLink}
              disabled={isStaff}
              className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 ${copied ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'} text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {copied ? <Check size={20} /> : <LinkIcon size={20} />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>

            {isStaff ? (
              <div className="absolute top-full right-0 mt-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Sem permissão para convidar
              </div>
            ) : (
              <div className="absolute top-full right-0 mt-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Clique para copiar o link de cadastro secreto
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {['todos', 'admin', 'lawyer', 'assistant'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'lawyer'
                ? 'Advogado'
                : tab === 'assistant'
                  ? 'Assistente'
                  : tab}
            </button>
          ))}
          <div className="hidden md:block">
            <TeamViewToggle view={viewMode} onChange={setViewMode} />
          </div>
        </div>
        <TeamFilters
          resultsCount={filteredMembers.length}
          onFilterChange={setFilterState}
        />
      </div>

      <main className="relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <RefreshCw
              className="animate-spin text-primary-600 mb-4"
              size={40}
            />
            <p className="text-[10px] font-black uppercase text-slate-400">
              Carregando time...
            </p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-bold">Nenhum membro encontrado</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
            {filteredMembers.map((member: any) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserId={currentUser?.id || ''}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        ) : (
          <TeamMemberTable
            members={filteredMembers}
            currentUserId={currentUser?.id || ''}
            onRowClick={(id) =>
              setSelectedMember(
                teamMembers.find((m: any) => m.id === id) || null
              )
            }
          />
        )}
      </main>

      {/* Convites Pendentes */}
      {!isStaff && (
        <section className="pt-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-navy-800" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Convites Pendentes (Legado)
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-navy-800" />
          </div>

          <PendingInvitesList />
        </section>
      )}

      {/* Removed AddTeamMemberModal */}

      <TeamMemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={() => {
          setSelectedMember(null);
          if (currentUser && selectedMember?.id === currentUser.id) {
            navigate('/settings?tab=perfil');
          } else {
            navigate('/settings?tab=equipe');
          }
        }}
        onDelete={handleDeleteMember}
        currentUserId={currentUser?.id || ''}
      />
    </div>
  );
};

export default Team;
