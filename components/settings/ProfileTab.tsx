import React, { useState, useEffect } from 'react';
import { User, Loader2, Rocket, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoUpload } from './PhotoUpload.tsx';
import { Lawyer } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { updateLawyer } from '../../utils/settingsPersistence';
import { useQueryClient } from '@tanstack/react-query';

export const ProfileTab: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { refreshAll } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Lawyer>>({
    full_name: '',
    name: '',
    email: '',
    oab: '',
    phone: '',
    specialty: '',
    bio: '',
    photo_url: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        full_name: (user as any).full_name || user.name,
      } as Partial<Lawyer>);
    }
  }, [user]);

  const handleChange = (field: keyof Lawyer, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const updates = {
        ...formData,
        name: formData.full_name || formData.name, // Keep both in sync
      };

      await profileService.updateProfile(user.id, updates);

      // Sync with localStorage and AppContext
      updateLawyer(updates);
      refreshAll();

      await refreshProfile();
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ['team'] });
      toast.success('Perfil atualizado!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const updates = {
        ...formData,
        name: formData.full_name || formData.name,
        first_login: false,
      };

      await profileService.updateProfile(user.id, updates);

      // Sync with localStorage and AppContext
      updateLawyer(updates);
      refreshAll();

      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ['team'] });
      navigate('/', { replace: true });
      window.location.reload(); // Force refresh to update auth state/redirection logic
    } catch (error) {
      console.error('Error completing registration:', error);
      toast.error('Erro ao completar cadastro');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {user?.first_login && (
        <div className="bg-primary-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-primary-500/20 flex flex-col md:flex-row items-center gap-6 animate-bounce-subtle">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Rocket size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-black tracking-tight">
              Seja bem-vindo(a)!
            </h3>
            <p className="text-primary-100 font-medium">
              Complete seus dados profissionais para liberar o acesso ao
              dashboard.
            </p>
          </div>
        </div>
      )}

      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
          Foto de Perfil
        </h3>
        <PhotoUpload
          currentPhotoUrl={formData.photo_url}
          name={formData.full_name || formData.name || ''}
          onPhotoChange={(url) => handleChange('photo_url', url)}
          onPhotoRemove={() => handleChange('photo_url', '')}
        />
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
              <User size={20} />
            </div>
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
              Dados Profissionais
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Nome Completo
              </label>
              <input
                type="text"
                value={formData.full_name || formData.name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                OAB
              </label>
              <input
                type="text"
                placeholder="UF 000.000"
                value={formData.oab || ''}
                onChange={(e) => handleChange('oab', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono"
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                E-mail (Login)
              </label>
              <input
                type="email"
                readOnly
                value={formData.email || ''}
                className="w-full pl-6 pr-10 py-4 bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl text-slate-500 cursor-not-allowed text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Bio Profissional
              </label>
              <textarea
                rows={5}
                maxLength={500}
                placeholder="Conte um pouco sobre sua trajetória..."
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-4">
          {user?.first_login ? (
            <button
              type="button"
              onClick={handleCompleteRegistration}
              disabled={isSaving}
              className="flex items-center gap-2 px-12 py-4 bg-slate-950 dark:bg-primary-600 hover:bg-slate-900 dark:hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              Completar Cadastro
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
            >
              {isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Check size={20} />
              )}
              Salvar Alterações
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
