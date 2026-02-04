
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Users, Folder, Calendar, Clock, DollarSign,
  BarChart2, Users2, Settings, LogOut, Moon, Sun, Bell, ListTodo, User, ChevronRight, Menu, X
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
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${active
      ? 'bg-primary-600 text-white shadow-md'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
      }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span className={`${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center`}>
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

  const displayUser = lawyer || user;

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800/50">
            <Link to="/" className="flex items-center gap-3 group">
              {office.logo_url ? (
                <div className="h-9 w-auto max-w-[120px] flex items-center">
                  <img src={office.logo_url} alt={office.name} className="h-full w-auto object-contain group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">L</div>
              )}
              {!office.logo_url && <span className="text-xl font-black dark:text-white tracking-tighter">LegalTech</span>}
            </Link>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => <SidebarItem key={item.to} {...item} active={location.pathname === item.to} />)}
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <SidebarItem to="/settings" icon={<Settings size={20} />} label="Configurações" active={location.pathname === '/settings'} />
            </div>
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-200">
                {displayUser?.photo_url ? <img src={displayUser.photo_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400 m-auto mt-2" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate dark:text-white leading-tight">{displayUser?.name || "Advogado"}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">OAB/{displayUser?.oab || "SP 000.000"}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30 shadow-sm">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => signOut()} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};