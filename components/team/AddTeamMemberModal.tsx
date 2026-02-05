import React, { useState, useMemo, useEffect } from "react";
import { X, Mail, Plus, Loader2, Shield } from "lucide-react";
import { inviteService } from "../../services/inviteService";
import { useApp } from "../../contexts/AppContext";
import { toast } from "sonner";
import { Role } from "../../types";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Triggered after successful invite
}

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { lawyer: currentUser } = useApp();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("lawyer");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userRole = (currentUser?.role as string) || "";
  const isAdmin = userRole === "admin";
  const isLawyer = userRole === "lawyer" || userRole === Role.LAWYER;

  // Define available options based on current user's role
  const availableRoles = useMemo(() => {
    const roles = [];
    if (isAdmin) {
      roles.push({ value: "admin", label: "Administrador" });
      roles.push({ value: "lawyer", label: "Advogado" });
    }
    if (isAdmin || isLawyer) {
      roles.push({ value: "assistant", label: "Assistente" });
      roles.push({ value: "intern", label: "Estagiário" });
    }
    return roles;
  }, [isAdmin, isLawyer]);

  // Set initial role if not set or invalid for current user
  useEffect(() => {
    if (availableRoles.length > 0) {
      const isValid = availableRoles.some((r) => r.value === role);
      if (!isValid) {
        setRole(availableRoles[0].value);
      }
    }
  }, [availableRoles, role]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !role) return;

    setIsSubmitting(true);
    try {
      await inviteService.createInvite(email, role);
      toast.success(`Convite enviado para ${email}`);
      onSave();
      onClose();
      setEmail("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao enviar convite");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black dark:text-white tracking-tight">
                Convidar Membro
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Nova admissão para o escritório
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleInvite} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
              E-mail do Convidado
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block px-1">
              Perfil / Cargo
            </label>
            <div className="relative">
              <Shield
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm cursor-pointer"
              >
                {availableRoles.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 h-[60px]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Plus size={20} />
              )}
              {isSubmitting ? "Enviando..." : "Enviar Convite"}
            </button>
          </div>
        </form>

        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            O convidado receberá um e-mail com as instruções para criar sua
            conta e acessar o painel do escritório.
          </p>
        </div>
      </div>
    </div>
  );
};
