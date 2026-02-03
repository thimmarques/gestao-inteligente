
import React, { useState, useEffect, useMemo } from 'react';
import {
  User, Building2, Globe, Monitor, ShieldCheck,
  Info, ChevronRight, Settings as SettingsIcon,
  HelpCircle, ExternalLink, ArrowLeft, FileSearch, Shield, Users
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { checkPermission } from '../utils/permissions';
import { getCriticalLogsCount24h } from '../utils/auditLogger';

import { ProfileTab } from '../components/settings/ProfileTab';
import { OfficeTab } from '../components/settings/OfficeTab';
import { IntegrationsTab } from '../components/settings/IntegrationsTab';
import { PreferencesTab } from '../components/settings/PreferencesTab';
import { SecurityTab } from '../components/settings/SecurityTab';
import { AboutTab } from '../components/settings/AboutTab';
import { LogsTab } from '../components/settings/LogsTab';

type SettingsTab = 'perfil' | 'escritorio' | 'integracoes' | 'logs' | 'preferencias' | 'seguranca' | 'sobre';

const Settings: React.FC = () => {
  const { lawyer: currentUser, refreshAll } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('perfil');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const tab = urlParams.get('tab') as SettingsTab;
    if (tab) setActiveTab(tab);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const criticalLogsCount = useMemo(() => {
    return getCriticalLogsCount24h();
  }, [activeTab]);

  const menuItems = useMemo(() => {
    const items: { id: SettingsTab; label: string; icon: any; color: string; alert?: boolean; }[] = [
      { id: 'perfil', label: 'Meu Perfil', icon: User, color: 'text-blue-500' },
      { id: 'escritorio', label: 'Escritório', icon: Building2, color: 'text-indigo-500' },
    ];

    items.push({ id: 'integracoes', label: 'Integrações', icon: Globe, color: 'text-primary-500' });

    if (currentUser?.role === 'admin') {
      items.push({ id: 'logs', label: 'Logs e Auditoria', icon: FileSearch, color: 'text-red-500', alert: criticalLogsCount > 0 });
    }

    items.push(
      { id: 'preferencias', label: 'Preferências', icon: Monitor, color: 'text-orange-500' },
      { id: 'seguranca', label: 'Segurança', icon: ShieldCheck, color: 'text-emerald-500' },
      { id: 'sobre', label: 'Sobre o Sistema', icon: Info, color: 'text-slate-500' }
    );
    return items;
  }, [currentUser, criticalLogsCount]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil': return <ProfileTab />;
      case 'escritorio': return <OfficeTab />;
      case 'integracoes': return <IntegrationsTab />;
      case 'preferencias': return <PreferencesTab />;
      case 'seguranca': return <SecurityTab />;
      case 'logs': return <LogsTab />;
      case 'sobre': return <AboutTab />;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-10 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <span>Escritório</span>
            <ChevronRight size={10} />
            <span className="text-primary-600">Painel de Configurações</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black dark:text-white tracking-tight mt-2 flex items-center gap-4">
            Ajustes do Sistema
            <SettingsIcon className="text-slate-300 animate-spin-slow hidden sm:block" size={32} />
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mt-1">Gerencie sua identidade visual, segurança e rastreabilidade de dados.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
        <aside className="space-y-4">
          <div className={`flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as SettingsTab)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group shrink-0 lg:shrink lg:w-full whitespace-nowrap ${isActive
                    ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                >
                  <div className={`p-2 rounded-xl transition-colors relative ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary-500'}`}>
                    <Icon size={18} />
                    {item.alert && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
                    )}
                  </div>
                  <div className="flex flex-col items-start leading-none">
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                    {item.alert && <span className="text-[8px] font-black text-red-500 uppercase mt-1 animate-pulse">Ação Crítica</span>}
                  </div>
                  {isActive && <ChevronRight size={14} className="ml-auto text-primary-600 hidden lg:block" />}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-h-[600px] animate-in slide-in-from-bottom-4 duration-500">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default Settings;
