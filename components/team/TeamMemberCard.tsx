import React from "react";
import {
  Crown,
  Briefcase,
  UserCog,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { TeamMember } from "../../types/team.ts";
import { Avatar } from "../ui/Avatar";

interface TeamMemberCardProps {
  member: TeamMember;
  onClick: () => void;
  currentUserId: string;
}

const roleConfig: Record<
  string,
  { icon: any; color: string; bg: string; label: string }
> = {
  admin: {
    icon: Crown,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/30",
    label: "Admin",
  },
  advogado: {
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    label: "Advogado",
  },
  lawyer: {
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    label: "Advogado",
  },
  assistente: {
    icon: UserCog,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/30",
    label: "Assistente",
  },
  assistant: {
    icon: UserCog,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-900/30",
    label: "Assistente",
  },
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onClick,
  currentUserId,
}) => {
  const isMe = member.id === currentUserId;
  const config = roleConfig[member.role.toLowerCase()] || roleConfig.advogado;
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-1 ${
        isMe
          ? "border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/5"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Role Badge */}
      <div
        className={`absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full border border-current opacity-80 ${config.color} ${config.bg}`}
      >
        <Icon size={12} strokeWidth={3} />
        <span className="text-[9px] font-black uppercase tracking-widest">
          {config.label}
        </span>
      </div>

      {/* Status & Me Badge */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            member.status === "ativo"
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${member.status === "ativo" ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
          />
          {member.status}
        </div>
        {isMe && (
          <div className="bg-yellow-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg">
            VOCÊ
          </div>
        )}
      </div>

      {/* Avatar & Header */}
      <div className="flex flex-col items-center text-center mt-6">
        <Avatar
          src={member.photo_url}
          name={member.name}
          size="custom"
          className="w-24 h-24 !rounded-[2rem] border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-500 text-3xl"
        />
        <h3 className="text-lg font-black dark:text-white mt-4 tracking-tight group-hover:text-primary-600 transition-colors">
          {member.name}
        </h3>
        {member.oab && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
            OAB/{member.oab}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 truncate w-full justify-center px-4">
          <Mail size={12} /> {member.email}
        </p>
      </div>

      <div className="my-6 h-px bg-slate-100 dark:bg-slate-800" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <span className="text-primary-600 font-black text-base tabular-nums">
            {member.stats?.active_cases || 0}
          </span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">
            Ativos
          </span>
        </div>
        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center">
          <span className="text-green-600 font-black text-base tabular-nums">
            {member.stats?.success_rate || 0}%
          </span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">
            Êxito
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            LegalTech Equipe
          </span>
          <button className="flex items-center gap-1 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:gap-2 transition-all">
            Ver Perfil
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
