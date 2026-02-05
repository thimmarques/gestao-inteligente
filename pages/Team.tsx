import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, ChevronRight, RefreshCw, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Role } from "../types";
import { TeamMember } from "../types/team";
import { TeamMemberCard } from "../components/team/TeamMemberCard";
import { TeamMemberTable } from "../components/team/TeamMemberTable";
import { TeamViewToggle } from "../components/team/TeamViewToggle";
import { TeamFilters } from "../components/team/TeamFilters";
import { AddTeamMemberModal } from "../components/team/AddTeamMemberModal";
import { TeamMemberDetailsModal } from "../components/team/TeamMemberDetailsModal";
import { useApp } from "../contexts/AppContext";

import { inviteService } from "../services/inviteService";
import { useTeam } from "../hooks/useQueries";
import { supabase } from "../lib/supabase";

const PendingInvitesList: React.FC = () => {
  const { lawyer: currentUser } = useApp();
  const { data: invites = [] as any[], isLoading } = useQuery({
    queryKey: ["invites"],
    queryFn: () => inviteService.listInvites(),
    enabled: !!currentUser?.office_id,
  });

  const pendingInvites = invites.filter(
    (i: any) => i.status === "pending" || i.status === "sent",
  );

  if (isLoading)
    return (
      <div className="animate-pulse h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
    );
  if (pendingInvites.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-dotted border-slate-300 dark:border-slate-700 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="font-bold text-sm dark:text-white">{invite.email}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              {invite.role} • Enviado em{" "}
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
  const { lawyer: currentUser } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"cards" | "table">(
    () => (localStorage.getItem("team_view") as any) || "cards",
  );
  const [activeTab, setActiveTab] = useState<
    "todos" | "admin" | "lawyer" | "assistant"
  >("todos");
  const [filterState, setFilterState] = useState({
    search: "",
    roles: [],
    status: "todos",
    sort: "name_asc",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const { data: teamMembers = [], isLoading, refetch } = useTeam();

  const filteredMembers = useMemo(() => {
    return teamMembers
      .filter((m: any) => {
        const matchSearch =
          m.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
          m.email.toLowerCase().includes(filterState.search.toLowerCase());

        const matchTab = activeTab === "todos" || m.role === activeTab;
        const matchRoles =
          filterState.roles.length === 0 || filterState.roles.includes(m.role);
        const matchStatus =
          filterState.status === "todos" || m.status === filterState.status;

        return matchSearch && matchTab && matchRoles && matchStatus;
      })
      .sort((a: any, b: any) => {
        if (filterState.sort === "name_asc")
          return a.name.localeCompare(b.name);
        if (filterState.sort === "cases_desc")
          return (b.stats?.active_cases || 0) - (a.stats?.active_cases || 0);
        return 0;
      });
  }, [teamMembers, filterState, activeTab]);

  const handleDeleteMember = async (id: string) => {
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) throw error;
    refetch();
    setSelectedMember(null);
  };

  const isStaff =
    (currentUser?.role as any) === Role.ASSISTANT ||
    (currentUser?.role as any) === Role.INTERN ||
    (currentUser?.role as any) === "assistant" ||
    (currentUser?.role as any) === "intern" ||
    (currentUser?.role as any) === "assistente" ||
    (currentUser?.role as any) === "estagiario";

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-white">
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

        <div className="relative group">
          <button
            onClick={() => !isStaff && setIsAddModalOpen(true)}
            disabled={isStaff}
            className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={20} />
            Adicionar Membro
          </button>
          {isStaff && (
            <div className="absolute top-full right-0 mt-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Sem permissão para convidar
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {["todos", "admin", "lawyer", "assistant"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px - 5 py - 2.5 rounded - xl text - [9px] font - black uppercase tracking - widest transition - all ${
                  activeTab === tab
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-700"
                } `}
              >
                {tab === "lawyer"
                  ? "Advogado"
                  : tab === "assistant"
                    ? "Assistente"
                    : tab}
              </button>
            ))}
          </div>
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
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member: any) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                currentUserId={currentUser?.id || ""}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        ) : (
          <TeamMemberTable
            members={filteredMembers}
            currentUserId={currentUser?.id || ""}
            onRowClick={(id) =>
              setSelectedMember(
                teamMembers.find((m: any) => m.id === id) || null,
              )
            }
          />
        )}
      </main>

      {/* Convites Pendentes */}
      {!isStaff && (
        <section className="pt-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Convites Pendentes
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <PendingInvitesList />
        </section>
      )}

      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => {
          refetch();
        }}
      />

      <TeamMemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={() => {
          setSelectedMember(null);
          if (currentUser && selectedMember?.id === currentUser.id) {
            navigate("/settings?tab=perfil");
          } else {
            navigate("/settings?tab=equipe");
          }
        }}
        onDelete={handleDeleteMember}
        currentUserId={currentUser?.id || ""}
      />
    </div>
  );
};

export default Team;
