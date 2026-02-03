
import React, { useState } from 'react';
import { Sun, Moon, Monitor, Bell, Globe, Calendar, Clock, Save, Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme.ts';

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
    weeklySummary: false
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    localStorage.setItem('legaltech_preferences', JSON.stringify({ fontSize, notifications }));
    setIsSaving(false);
    alert('Preferências salvas!');
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const themes = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Escuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl">
            <Monitor size={20} />
          </div>
          <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">Aparência do Sistema</h3>
        </div>

        <div className="space-y-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tema Principal</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group ${
                    isActive 
                      ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500'}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-sm font-bold uppercase tracking-widest ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-500'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex justify-between items-center">
             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Tamanho da Fonte</label>
             <span className="text-sm font-bold dark:text-white tabular-nums">{fontSize}px</span>
           </div>
           <input 
             type="range" min="12" max="20" step="1" 
             value={fontSize} 
             onChange={(e) => setFontSize(parseInt(e.target.value))}
             className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
           />
        </div>
      </section>

      <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
         <button 
           onClick={handleSave}
           disabled={isSaving}
           className="flex items-center gap-3 px-12 py-5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
         >
           {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
           Salvar Preferências
         </button>
      </div>
    </div>
  );
};
