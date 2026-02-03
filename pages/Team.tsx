
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { UserPlus, ChevronRight, RefreshCw, Users } from 'lucide-react';
import { TeamMember } from '../types/team.ts';
import { TeamMemberCard } from '../../components/team/TeamMemberCard.tsx';
import { TeamMemberTable } from '../../components/team/TeamMemberTable.tsx';
import { TeamViewToggle } from '../../components/team/TeamViewToggle.tsx';
import { TeamFilters } from '../../components/team/TeamFilters.tsx';
import { TeamProductivityChart } from '../../components/team/TeamProductivityChart.tsx';
import { AddTeamMemberModal } from '../../components/team/AddTeamMemberModal.tsx';
import { TeamMemberDetailsModal } from '../../components/team/TeamMemberDetailsModal.tsx';
import { useApp } from '../contexts/AppContext.tsx';
import { checkPermission } from '../utils/permissions.ts';
import { inviteService, PendingInvite } from '../services/inviteService.ts';

const STORAGE_KEY = 'legaltech_team';

const Team: React.FC = () => {
  const { lawyer: currentUser } = useApp();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() => (localStorage.getItem('team_view') as any) || 'cards');
  const [activeTab, setActiveTab] = useState<'todos' | 'admin' | 'advogado' | 'assistente'>('todos');
  const [filterState, setFilterState] = useState({ search: '', roles: [], status: 'todos', sort: 'name_asc' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const storedTeam = localStorage.getItem(STORAGE_KEY);
    let members: TeamMember[] = storedTeam ? JSON.parse(storedTeam) : [];

    if (currentUser && !members.find(m => m.email === currentUser.email || m.id === currentUser.id)) {
      const currentAsMember: any = {
        ...currentUser,
        status: 'ativo',
        permissions: currentUser.role === 'admin' ? {
          can_create_cases: true, can_edit_cases: true, can_delete_cases: true,
          can_manage_finance: true, can_manage_team: true, can_view_all_cases: true
        } : {
          can_create_cases: true, can_edit_cases: true, can_delete_cases: false,
          can_manage_finance: true, can_manage_team: false, can_view_all_cases: false
        },
        stats: { active_cases: 12, completed_cases: 45, pending_deadlines: 3, success_rate: 85 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      members = [currentAsMember];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }

    setTeamMembers(members);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredMembers = useMemo(() => {
    return teamMembers.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
        m.email.toLowerCase().includes(filterState.search.toLowerCase());

      const matchTab = activeTab === 'todos' || m.role === activeTab;
      const matchRoles = filterState.roles.length === 0 || filterState.roles.includes(m.role);
      const matchStatus = filterState.status === 'todos' || m.status === filterState.status;

      return matchSearch && matchTab && matchRoles && matchStatus;
    }).sort((a, b) => {
      if (filterState.sort === 'name_asc') return a.name.localeCompare(b.name);
      if (filterState.sort === 'cases_desc') return (b.stats?.active_cases || 0) - (a.stats?.active_cases || 0);
      return 0;
    });
  }, [teamMembers, filterState, activeTab]);

  const handleAddMember = async (data: any) => {
    const newMember: TeamMember = {
      ...data,
      id: crypto.randomUUID(),
      office_id: currentUser?.office_id || 'office-1',
      stats: { active_cases: 0, completed_cases: 0, pending_deadlines: 0, success_rate: 0 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...teamMembers, newMember];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadData();
  };

  const handleDeleteMember = async (id: string) => {
    const updated = teamMembers.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    loadData();
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <span>Escritório</span>
            <ChevronRight size={10} />
            <span className="text-primary-600">Equipe</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black dark:text-white tracking-tight">Time do Escritório</h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!checkPermission(currentUser, 'can_manage_team')}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <UserPlus size={20} />
          Adicionar Membro
        </button>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {['todos', 'advogado', 'assistente'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="hidden md:block">
            <TeamViewToggle view={viewMode} onChange={setViewMode} />
          </div>
        </div>
        <TeamFilters resultsCount={filteredMembers.length} onFilterChange={setFilterState} />
      </div>

      <main className="relative min-h-[300px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <RefreshCw className="animate-spin text-primary-600 mb-4" size={40} />
            <p className="text-[10px] font-black uppercase text-slate-400">Carregando...</p>
          </div>
        ) : (
          viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map(member => (
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
              onRowClick={(id) => setSelectedMember(teamMembers.find(m => m.id === id) || null)}
            />
          )
        )}
      </main>

      <AddTeamMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddMember} />
      <TeamMemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => { setSelectedMember(null); alert('Redirecionando para edição em Configurações...'); }}
        onDelete={handleDeleteMember}
        currentUserId={currentUser?.id || ''}
      />
    </div>
  );
};

export default Team;
