
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Crown, Briefcase, UserCog, Check, ArrowRight, ArrowLeft, 
  Camera, Upload, Save, Loader2, Mail, Phone, Info, Globe,
  ShieldCheck, CheckCircle2, AlertCircle, Shield, Lock, FileText,
  Users, DollarSign
} from 'lucide-react';
import { TeamRole, TeamMemberPermissions } from '../../types/team';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const DEFAULT_PERMISSIONS: Record<TeamRole, TeamMemberPermissions> = {
  admin: {
    can_create_cases: true,
    can_edit_cases: true,
    can_delete_cases: true,
    can_manage_finance: true,
    can_manage_team: true,
    can_view_all_cases: true
  },
  advogado: {
    can_create_cases: true,
    can_edit_cases: true,
    can_delete_cases: false,
    can_manage_finance: true,
    can_manage_team: false,
    can_view_all_cases: false
  },
  assistente: {
    can_create_cases: false,
    can_edit_cases: false,
    can_delete_cases: false,
    can_manage_finance: false,
    can_manage_team: false,
    can_view_all_cases: true
  }
};

export const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<TeamRole | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    oab: '',
    phone: '',
    specialty: '',
    bio: '',
    linkedin: '',
    instagram: '',
  });

  const [permissions, setPermissions] = useState<TeamMemberPermissions>(DEFAULT_PERMISSIONS.advogado);

  useEffect(() => {
    if (role) {
      setPermissions(DEFAULT_PERMISSIONS[role]);
    }
  }, [role]);

  if (!isOpen) return null;

  const roles = [
    { 
      id: 'admin' as TeamRole, 
      label: 'Administrador', 
      icon: Crown, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Acesso total ao sistema, gerencia equipe e configurações.',
      perms: ['Gerenciar equipe', 'Configurar sistema', 'Acesso total a dados']
    },
    { 
      id: 'advogado' as TeamRole, 
      label: 'Advogado', 
      icon: Briefcase, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'Gerencia próprios processos, clientes e agenda pessoal.',
      perms: ['Criar processos', 'Gerenciar clientes', 'Controle financeiro']
    },
    { 
      id: 'assistente' as TeamRole, 
      label: 'Assistente Jurídico', 
      icon: UserCog, 
      color: 'text-green-600', 
      bg: 'bg-green-50 dark:bg-green-900/20',
      description: 'Auxilia advogados em rotinas, sem acesso a dados sensíveis.',
      perms: ['Ver processos', 'Agendar eventos', 'Criar prazos']
    }
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isStep2Valid = formData.name.length >= 3 && formData.email.includes('@') && formData.phone.length >= 10 && (role !== 'advogado' || formData.oab.length >= 5);

  const togglePermission = (key: keyof TeamMemberPermissions) => {
    if (role === 'admin') return; // Admin sempre tem tudo
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    onSave({ 
      ...formData, 
      role, 
      permissions,
      photo_url: photoPreview, 
      status: 'ativo' 
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">
        
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tight">
                {step === 1 ? 'Nova Função' : step === 2 ? 'Dados Pessoais' : 'Permissões de Acesso'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-primary-600' : 'bg-slate-100 dark:bg-slate-800'}`} />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Etapa {step} de 3</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold dark:text-white">Qual será a função deste membro?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = role === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`flex flex-col items-center p-8 rounded-[2rem] border-2 transition-all group text-center relative ${
                        isActive 
                          ? `border-primary-600 ${r.bg} scale-[1.02] shadow-xl` 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner ${r.color} ${isActive ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800'}`}>
                        <Icon size={32} />
                      </div>
                      <h4 className="text-base font-black dark:text-white mb-2">{r.label}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4">{r.description}</p>
                      <div className="space-y-1 w-full border-t border-slate-200 dark:border-slate-700 pt-4">
                        {r.perms.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            <div className="w-1 h-1 rounded-full bg-slate-300" /> {p}
                          </div>
                        ))}
                      </div>
                      {isActive && <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in"><Check size={18} strokeWidth={3} /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300 pb-10">
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-all overflow-hidden relative group"
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-300" />}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <Upload size={20} />
                    <span className="text-[8px] font-black uppercase mt-1">Alterar</span>
                  </div>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Adicionar Foto</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nome Completo*</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white" 
                    placeholder="Ex: João da Silva"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">E-mail Corporativo*</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="email" required
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white" 
                      placeholder="joao@escritorio.com.br"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Telefone*</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" required
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Inscrição OAB {role !== 'assistente' && '*'}</label>
                  <input 
                    type="text" required={role !== 'assistente'}
                    value={formData.oab} onChange={e => setFormData({...formData, oab: e.target.value.toUpperCase()})}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white font-mono" 
                  />
                </div>

                {role === 'advogado' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Especialidade Principal</label>
                    <input 
                      type="text"
                      value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white" 
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-primary-600">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold dark:text-white">Configure as permissões de acesso</h3>
                  <p className="text-xs text-slate-500 font-medium">Cargo selecionado: <span className="text-primary-600 font-black uppercase">{role}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Processos */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <FileText size={14} /> Processos Judiciais
                  </h4>
                  <div className="space-y-3">
                    <PermissionToggle label="Criar novos processos" sub="Permite cadastrar processos e casos" checked={permissions.can_create_cases} onChange={() => togglePermission('can_create_cases')} disabled={role === 'assistente'} />
                    <PermissionToggle label="Editar todos os processos" sub="Permite alterar dados de qualquer caso" checked={permissions.can_edit_cases} onChange={() => togglePermission('can_edit_cases')} disabled={role !== 'admin'} />
                    <PermissionToggle label="Deletar processos" sub="Ação crítica de exclusão definitiva" checked={permissions.can_delete_cases} onChange={() => togglePermission('can_delete_cases')} disabled={role !== 'admin'} />
                    <PermissionToggle label="Ver processos de todos" sub="Caso OFF, vê apenas os seus processos" checked={permissions.can_view_all_cases} onChange={() => togglePermission('can_view_all_cases')} />
                  </div>
                </div>

                {/* Clientes e Financeiro */}
                <div className="space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Users size={14} /> Gestão de Clientes
                      </h4>
                      <PermissionToggle label="Gerenciar Clientes" sub="Cadastrar e editar base de clientes" checked={permissions.can_create_cases} onChange={() => {}} disabled={role === 'assistente'} />
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <DollarSign size={14} /> Financeiro
                      </h4>
                      <PermissionToggle label="Gestão Financeira" sub="Lançamentos de receitas e despesas" checked={permissions.can_manage_finance} onChange={() => togglePermission('can_manage_finance')} disabled={role === 'assistente'} />
                      <PermissionToggle label="Gerenciar Equipe" sub="Adicionar ou remover membros" checked={permissions.can_manage_team} onChange={() => togglePermission('can_manage_team')} disabled={role !== 'admin'} />
                   </div>
                </div>
              </div>

              <div className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 shadow-inner">
                <h4 className="text-xs font-black dark:text-white uppercase tracking-widest mb-4">Resumo do Perfil</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(permissions).filter(([_, v]) => v).map(([k]) => (
                    <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl text-[9px] font-black uppercase border border-green-100 dark:border-green-800">
                      <CheckCircle2 size={10} strokeWidth={3} /> {k.replace('can_', '').replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button 
            type="button" 
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest"
          >
            {step === 1 ? 'Cancelar' : <><ArrowLeft size={16} /> Voltar</>}
          </button>
          
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : handleFinalSave()}
            disabled={(step === 1 && !role) || (step === 2 && !isStep2Valid) || isSubmitting}
            className="flex items-center gap-3 px-12 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : step < 3 ? <ArrowRight size={20} /> : <Save size={20} />}
            {isSubmitting ? 'Salvando...' : step < 3 ? 'Continuar' : 'Criar Membro'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PermissionToggle = ({ label, sub, checked, onChange, disabled = false }: any) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${disabled ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-primary-200 dark:hover:border-primary-900/30'}`}>
    <div className="space-y-0.5">
      <p className="text-xs font-bold dark:text-white uppercase tracking-tight">{label}</p>
      <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
    </div>
    <button 
      type="button"
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${checked ? 'translate-x-6' : ''}`} />
    </button>
  </div>
);
