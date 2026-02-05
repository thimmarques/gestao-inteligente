import React from "react";
import {
  Edit,
  Trash2,
  Crown,
  Briefcase,
  UserCog,
  ChevronRight,
} from "lucide-react";
import { TeamMember } from "../../types/team";

interface TeamMemberTableProps {
  members: TeamMember[];
  onRowClick: (id: string) => void;
  currentUserId: string;
}

const roleBadge = (role: string) => {
  const normalized = role.toLowerCase();
  if (normalized === "admin")
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
        <Crown size={10} /> Admin
      </span>
    );
  if (normalized === "advogado" || normalized === "lawyer")
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
        <Briefcase size={10} /> Advogado
      </span>
    );
  if (normalized === "assistente" || normalized === "assistant")
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-800">
        <UserCog size={10} /> Assistente
      </span>
    );
  return null;
};

export const TeamMemberTable: React.FC<TeamMemberTableProps> = ({
  members,
  onRowClick,
  currentUserId,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 md:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Membro
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Função
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                OAB
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                Status
              </th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-8 py-20 text-center text-slate-400 italic"
                >
                  Nenhum membro encontrado.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const isMe = member.id === currentUserId;
                return (
                  <tr
                    key={member.id}
                    onClick={() => onRowClick(member.id)}
                    className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${isMe ? "bg-yellow-500/5" : ""}`}
                  >
                    <td className="px-6 md:px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {member.photo_url ? (
                            <img
                              src={member.photo_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="font-bold text-slate-400 uppercase">
                              {member.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-2 truncate">
                            {member.name}
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded-md bg-yellow-500 text-white text-[8px] font-black">
                                VOCÊ
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{roleBadge(member.role)}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                      {member.oab || "-"}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div
                        className={`flex items-center gap-2 text-[10px] font-black uppercase ${member.status === "ativo" ? "text-green-600" : "text-slate-400"}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${member.status === "ativo" ? "bg-green-500 animate-pulse" : "bg-slate-300"}`}
                        />
                        {member.status}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <ChevronRight
                        className="ml-auto text-slate-300 group-hover:text-primary-500 transition-all"
                        size={20}
                      />
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
