import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { LogoUpload } from './LogoUpload';
import { Office } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { updateOffice } from '../../utils/settingsPersistence';
import { settingsConfig } from '../../utils/settingsConfig';

export const OfficeTab: React.FC = () => {
  const { office, refreshAll } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Office>({
    id: 'office-1',
    name: 'Escritório Advocacia',
    logo_url: '',
    cnpj: '',
    address: '',
    phone: '',
    email: '',
    site: '',
  });

  useEffect(() => {
    if (office) {
      setFormData(office);
    }
  }, [office]);

  const handleChange = (field: keyof Office, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    updateOffice(formData);
    refreshAll();
    setIsSaving(false);
    alert('Escritório atualizado!');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <form onSubmit={handleSave} className="space-y-4">
        <div className={settingsConfig.cardClass + ' space-y-5'}>
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className={settingsConfig.sectionTitleClass}>
                Informações Institucionais
              </h3>
              <p className={settingsConfig.sectionDescClass}>
                Logo, dados do escritório para relatórios e rodapés
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="shrink-0">
              <LogoUpload
                currentLogoUrl={formData.logo_url}
                onLogoChange={(url) => handleChange('logo_url', url)}
                onLogoRemove={() => handleChange('logo_url', '')}
              />
            </div>

            <div className={'flex-1 ' + settingsConfig.gridClass}>
              <div className="space-y-1 md:col-span-2">
                <label className={settingsConfig.labelClass}>
                  Nome do Escritório
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={settingsConfig.inputClass + ' font-bold text-base'}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  className={settingsConfig.inputClass + ' font-mono'}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>
                  E-mail Comercial
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={settingsConfig.inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>Telefone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={settingsConfig.inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={settingsConfig.labelClass}>Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.site}
                  onChange={(e) => handleChange('site', e.target.value)}
                  className={settingsConfig.inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className={settingsConfig.labelClass}>
              Endereço Completo
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className={settingsConfig.inputClass + ' resize-none h-auto'}
              placeholder="Logradouro, nº, bairro, cidade - UF"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
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
            Salvar Escritório
          </button>
        </div>
      </form>
    </div>
  );
};
