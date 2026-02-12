import React, { useState, useEffect } from 'react';
import { User, Loader2, Rocket, Check, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoUpload } from './PhotoUpload.tsx';
import { Lawyer } from '../../types.ts';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { updateLawyer } from '../../utils/settingsPersistence';
import { useQueryClient } from '@tanstack/react-query';
import { settingsConfig } from '../../utils/settingsConfig';

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
    <div className="space-y-4 animate-in fade-in duration-500">
      {user?.first_login && (
        <div className="bg-primary-600 text-white p-5 rounded-xl shadow-lg shadow-primary-500/20 flex flex-col md:flex-row items-center gap-4 animate-bounce-subtle">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
            <Rocket size={20} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-base font-black tracking-tight">
              Seja bem-vindo(a)!
            </h3>
            <p className="text-primary-100 font-medium text-sm">
              Complete seus dados profissionais para liberar o acesso ao
              dashboard.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className={settingsConfig.cardClass + ' space-y-5'}>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg">
              <User size={18} />
            </div>
            <div>
              <h3 className={settingsConfig.sectionTitleClass}>
                Identidade Profissional
              </h3>
              <p className={settingsConfig.sectionDescClass}>
                Foto, dados pessoais e informações visíveis à equipe
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Photo */}
            <div className="flex flex-col items-center shrink-0 md:w-40">
              <label
                className={settingsConfig.labelClass + ' text-center mb-2'}
              >
                Foto de Perfil
              </label>
              <PhotoUpload
                currentPhotoUrl={formData.photo_url}
                name={formData.full_name || formData.name || ''}
                onPhotoChange={(url) => handleChange('photo_url', url)}
                onPhotoRemove={() => handleChange('photo_url', '')}
              />
            </div>

            {/* Fields */}
            <div className={'flex-1 ' + settingsConfig.gridClass}>
              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.full_name || formData.name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className={settingsConfig.inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>OAB</label>
                <input
                  type="text"
                  placeholder="UF 000.000"
                  value={formData.oab || ''}
                  onChange={(e) => handleChange('oab', e.target.value)}
                  className={settingsConfig.inputClass + ' font-mono'}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>
                  E-mail (Login)
                </label>
                <input
                  type="email"
                  readOnly
                  value={formData.email || ''}
                  className={
                    settingsConfig.inputClass +
                    ' opacity-60 cursor-not-allowed bg-slate-100 dark:bg-navy-800/50'
                  }
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>Telefone</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={settingsConfig.inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={settingsConfig.labelClass}>
              Resumo Curricular (Bio)
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Conte um pouco sobre sua trajetória..."
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              className={settingsConfig.inputClass + ' resize-none h-auto'}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {user?.first_login ? (
            <button
              type="button"
              onClick={handleCompleteRegistration}
              disabled={isSaving}
              className={settingsConfig.buttonPrimaryClass
                .replace('bg-primary-600', 'bg-slate-900')
                .replace('hover:bg-primary-700', 'hover:bg-slate-800')}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Completar Cadastro
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className={settingsConfig.buttonPrimaryClass}
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Salvar Alterações
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
