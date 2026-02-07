import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  Globe,
  Calendar,
  Clock,
  Save,
  Loader2,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';
import { settingsConfig } from '../../utils/settingsConfig';

export const PreferencesTab: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [notifications, setNotifications] = useState({
    nearDeadlines: true,
    urgentDeadlines: true,
    hearingsDayBefore: true,
    hearingsHourBefore: false,
    overduePayments: true,
    weeklySummary: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    localStorage.setItem(
      'legaltech_preferences',
      JSON.stringify({ fontSize, notifications })
    );
    setIsSaving(false);
    alert('Preferências salvas!');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const themes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <section className={settingsConfig.cardClass + ' space-y-8'}>
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg">
            <Monitor size={18} />
          </div>
          <div>
            <h3 className={settingsConfig.sectionTitleClass}>
              Aparência do Sistema
            </h3>
            <p className={settingsConfig.sectionDescClass}>
              Personalize sua experiência visual
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className={settingsConfig.labelClass}>Tema Principal</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${
                    isActive
                      ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500'}`}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className={`text-sm font-bold uppercase tracking-wide ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-500'}`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center">
            <label className={settingsConfig.labelClass}>
              Tamanho da Fonte
            </label>
            <span className="text-sm font-bold dark:text-white tabular-nums bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              {fontSize}px
            </span>
          </div>
          <input
            type="range"
            min="12"
            max="20"
            step="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={settingsConfig.buttonPrimaryClass}
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Salvar Preferências
          </button>
        </div>
      </section>
    </div>
  );
};
