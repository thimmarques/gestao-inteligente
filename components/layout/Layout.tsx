import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, Folder, Calendar, Clock, DollarSign,
  BarChart2, Users2, Settings, LogOut, Moon, Sun, Bell, ListTodo, User, Menu, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { useDeadlines, useSchedules, useNotifications, useTasks } from '../../hooks/useQueries';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge, badgeColor = "bg-red-500", active }) => (
  <Link
    to={to}
    className={`relative flex items-center justify-between px-4 py-3 my-1 rounded-xl transition-all duration-300 group ${active
      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-bold shadow-sm'
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
  >
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-600 rounded-r-full shadow-[0_0_12px_rgba(37,99,235,0.6)]" />
    )}
    <div className="flex items-center gap-3.5 z-10">
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </div>
      <span className="text-sm tracking-wide">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`${badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm ring-2 ring-white dark:ring-slate-900`}>
        {badge}
      </span>
    )}
  </Link>
);

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { lawyer, office } = useApp();

  const { data: deadlines = [] } = useDeadlines();
  const { data: schedules = [] } = useSchedules();
  const { data: notifications = [] } = useNotifications();
  const { data: tasks = [] } = useTasks();

  const displayUser = user || lawyer;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const pendingDeadlines = deadlines.filter((d: any) => d.status === 'pendente').length;

  const today = new Date().toDateString();
  const todaySchedules = schedules.filter((s: any) =>
    s.status === 'agendado' && new Date(s.start_time).toDateString() === today
  ).length;

  const pendingTasks = tasks.filter((t: any) => t.status === 'pendente').length;

  const menuItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { to: '/processos', icon: <Folder size={20} />, label: 'Processos' },
    { to: '/agenda', icon: <Calendar size={20} />, label: 'Agenda', badge: todaySchedules },
    { to: '/prazos', icon: <Clock size={20} />, label: 'Prazos', badge: pendingDeadlines },
    { to: '/tarefas', icon: <ListTodo size={20} />, label: 'Tarefas', badge: pendingTasks },
    { to: '/financeiro', icon: <DollarSign size={20} />, label: 'Financeiro' },
    { to: '/relatorios', icon: <BarChart2 size={20} />, label: 'Relatórios' },
    { to: '/equipe', icon: <Users2 size={20} />, label: 'Equipe' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary-500/30">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border-r border-slate-200/60 dark:border-slate-800/60 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 border-b border-slate-100/50 dark:border-slate-800/50">
            <Link to="/" className="flex items-center gap-4 group">
              {office.logo_url ? (
                <div className="h-10 w-auto max-w-[140px] flex items-center">
                  <img src={office.logo_url} alt={office.name} className="h-full w-auto object-contain group-hover:scale-105 transition-transform duration-500 ease-out" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-500">L</div>
              )}
              {!office.logo_url && <span className="text-xl font-black dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors">LegalTech</span>}
            </Link>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />)}
            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/50">
              <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sistema</h4>
              <SidebarItem to="/settings" icon={<Settings size={20} />} label="Configurações" active={location.pathname === '/settings'} />
            </div>
          </nav>
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-default group">
              <div className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-600 overflow-hidden bg-slate-200 group-hover:border-primary-200 transition-colors">
                {displayUser?.photo_url ? <img src={displayUser.photo_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400 m-auto mt-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate dark:text-white leading-tight group-hover:text-primary-600 transition-colors">{displayUser?.name || "Advogado"}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{displayUser?.oab ? `OAB/${displayUser.oab}` : 'OAB Pendente'}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="absolute top-0 left-0 right-0 h-20 flex items-center justify-between px-8 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shrink-0 z-30 transition-all duration-300">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-primary-600 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none rounded-xl transition-all duration-300 active:scale-95 group">
              <Bell size={20} className="group-hover:animate-swing" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none rounded-xl transition-all duration-300 active:scale-95">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <button onClick={() => signOut()} className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95 font-bold text-xs uppercase tracking-wider" title="Sair">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto pt-20 custom-scrollbar p-0 bg-slate-50/50 dark:bg-slate-950">{children}</div>
      </main>
    </div>
  );
};