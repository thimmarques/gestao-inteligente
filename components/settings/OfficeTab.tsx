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
    <div className="space-y-10 animate-in fade-in duration-500">
      <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-12 items-center md:items-start">
        <LogoUpload
          currentLogoUrl={formData.logo_url}
          onLogoChange={(url) => handleChange('logo_url', url)}
          onLogoRemove={() => handleChange('logo_url', '')}
        />
      </section>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-12">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <Building2 size={20} />
            </div>
            <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
              Informações Institucionais
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Nome do Escritório
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-base font-bold shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                CNPJ
              </label>
              <input
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                E-mail Comercial
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Telefone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Website
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.site}
                onChange={(e) => handleChange('site', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Endereço Completo
              </label>
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
                placeholder="Logradouro, nº, bairro, cidade - UF"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-12 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
          >
            {isSaving ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Salvar Escritório
          </button>
        </div>
      </form>
    </div>
  );
};
