import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Folder,
  Calendar,
  Clock,
  DollarSign,
  BarChart2,
  FileText,
  TrendingUp,
  Users2,
  Target,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  Search,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "./Avatar";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: string;
  active?: boolean;
}

// Fix: typed as React.FC to correctly handle the 'key' prop and changed 'class' to 'className'
const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon,
  label,
  badge,
  badgeColor = "bg-red-500",
  active,
}) => (
  <Link
    to={to}
    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
      active
        ? "bg-primary-600 text-white shadow-md"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    {badge !== undefined && badge > 0 && (
      <span
        className={`${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center`}
      >
        {badge}
      </span>
    )}
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const menuItems = [
    { to: "/", icon: <Home size={20} />, label: "Dashboard" },
    { to: "/clientes", icon: <Users size={20} />, label: "Clientes" },
    { to: "/processos", icon: <Folder size={20} />, label: "Processos" },
    { to: "/agenda", icon: <Calendar size={20} />, label: "Agenda", badge: 2 },
    { to: "/prazos", icon: <Clock size={20} />, label: "Prazos", badge: 5 },
    { to: "/financeiro", icon: <DollarSign size={20} />, label: "Financeiro" },
    { to: "/relatorios", icon: <BarChart2 size={20} />, label: "Relatórios" },
    { to: "/templates", icon: <FileText size={20} />, label: "Templates" },
    { to: "/desempenho", icon: <TrendingUp size={20} />, label: "Desempenho" },
    { to: "/equipe", icon: <Users2 size={20} />, label: "Equipe" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform lg:static lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                L
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                LegalTech
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-500"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
              />
            ))}

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <SidebarItem
                to="/foco"
                icon={<Target size={20} />}
                label="Modo Foco"
              />
              <SidebarItem
                to="/configuracoes"
                icon={<Settings size={20} />}
                label="Configurações"
              />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 p-2">
              <Avatar
                src={user?.photo_url || null}
                name={user?.name || "User"}
                size="md"
                className="border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer"
                onClick={() => navigate("/configuracoes")}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate dark:text-white"
                  title={user?.name || ""}
                >
                  {user?.name || "Usuário"}
                </p>
                {user?.oab ? (
                  <p className="text-xs text-slate-500 truncate font-mono">
                    OAB {user.oab}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 truncate">
                    {user?.email}
                  </p>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30">
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar processos, clientes... (Ctrl + K)"
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
