import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Folder,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  Loader2,
  MoreHorizontal,
  Calendar as CalendarIcon,
  FileText,
} from 'lucide-react';
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { TeamWidget } from '../components/dashboard/TeamWidget';
import { CriticalLogsWidget } from '../components/dashboard/CriticalLogsWidget';
import { useAuth } from '../contexts/AuthContext';
import { EventDetailsModal } from '../components/schedule/EventDetailsModal';
import { DeadlineDetailsModal } from '../components/deadlines/DeadlineDetailsModal';
import { scheduleService } from '../services/scheduleService';
import { deadlineService } from '../services/deadlineService';
import {
  useClients,
  useCases,
  useDeadlines,
  useFinances,
  useSchedules,
} from '../hooks/useQueries';

const KPICard = ({
  label,
  value,
  trend,
  isPositive,
  icon,
  sub,
  onClick,
  colorClass,
}: any) => (
  <button
    onClick={onClick}
    className="relative bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 soft-shadow text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden w-full"
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} to-transparent rounded-bl-full -mr-10 -mt-10 opacity-20 group-hover:opacity-30 transition-opacity`}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div
          className={`p-3.5 rounded-2xl shadow-sm ring-1 ring-inset ${isPositive ? 'bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-900/30' : 'bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-900/30'}`}
        >
          {React.cloneElement(icon, { size: 22 })}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={12} strokeWidth={2.5} />
            )}
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest">
          {label}
        </h3>
        <span className="text-3xl font-black dark:text-white tracking-tight block text-slate-800">
          {value}
        </span>
      </div>

      {sub && (
        <p className="mt-4 text-[10px] font-medium text-slate-400 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {sub}
        </p>
      )}
    </div>
  </button>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: cases = [], isLoading: loadingCases } = useCases();
  const { data: deadlines = [], isLoading: loadingDeadlines } = useDeadlines();
  const { data: finances = [], isLoading: loadingFinances } = useFinances();
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules();

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);

  const stats = useMemo(() => {
    const revenueThisMonth = finances
      .filter((f: any) => f.type === 'receita' && f.status === 'pago')
      .reduce((acc: number, curr: any) => acc + curr.amount, 0);

    const urgentDeadlines = deadlines.filter(
      (d: any) => d.status === 'pendente' && d.priority === 'urgente'
    ).length;

    const today = new Date().toDateString();
    const todaySchedules = schedules
      .filter(
        (s: any) =>
          s.status === 'agendado' &&
          new Date(s.start_time).toDateString() === today
      )
      .sort(
        (a: any, b: any) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );

    return { revenueThisMonth, urgentDeadlines, todaySchedules };
  }, [finances, deadlines, schedules]);

  const isLoading =
    loadingClients ||
    loadingCases ||
    loadingDeadlines ||
    loadingFinances ||
    loadingSchedules;

  const statsCards = [
    {
      label: 'Clientes Ativos',
      value: clients.filter((c: any) => c.status === 'ativo').length,
      trend: '+12%',
      isPositive: true,
      icon: <Users />,
      sub: 'Base total de clientes',
      path: '/clientes',
      colorClass: 'from-blue-500',
    },
    {
      label: 'Processos',
      value: cases.length,
      trend: '+5%',
      isPositive: true,
      icon: <Folder />,
      sub: 'Processos em andamento',
      path: '/processos',
      colorClass: 'from-indigo-500',
    },
    {
      label: 'Prazos Pendentes',
      value: deadlines.filter((d: any) => d.status === 'pendente').length,
      trend: `${stats.urgentDeadlines} URGENTES`,
      isPositive: stats.urgentDeadlines === 0,
      icon: <Clock />,
      sub: 'Monitoramento de prazos',
      path: '/prazos',
      colorClass: 'from-orange-500',
    },
    {
      label: 'Receita (Mês)',
      value: formatCurrency(stats.revenueThisMonth),
      trend: '+8%',
      isPositive: true,
      icon: <DollarSign />,
      sub: 'Entradas confirmadas',
      path: '/financeiro',
      colorClass: 'from-emerald-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary-200" size={48} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Carregando Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in duration-500 pb-32 text-slate-800 dark:text-slate-100 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {getGreeting()}, {user?.name || 'Advogado'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Aqui está o resumo estratégico do seu escritório hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <CalendarIcon size={14} />
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <KPICard key={i} {...stat} onClick={() => navigate(stat.path)} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 soft-shadow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg tracking-tight flex items-center gap-3 text-slate-800 dark:text-white">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-primary-600">
                <TrendingUp size={20} />
              </div>
              Performance Financeira
            </h3>
            <button
              onClick={() => navigate('/financeiro')}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div className="h-[320px] w-full">
            {finances.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={finances.slice(-10)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeOpacity={0.5}
                  />
                  <XAxis dataKey="due_date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Valor',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                  <BarChart3 size={32} className="opacity-50" />
                </div>
                <p>Nenhum dado financeiro para exibir.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TeamWidget />
          {user?.role === 'admin' && <CriticalLogsWidget />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 soft-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-3 text-slate-800 dark:text-white">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                <Clock size={20} />
              </div>
              Agenda de Hoje
            </h3>
            <button
              onClick={() => navigate('/agenda')}
              className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest hover:underline transition-all"
            >
              Ver Completa
            </button>
          </div>
          <div className="space-y-2">
            {stats.todaySchedules.length > 0 ? (
              stats.todaySchedules.slice(0, 5).map((task: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedEvent(task)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all group text-left"
                >
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs text-slate-500 group-hover:text-indigo-600 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-700">
                    {new Date(task.start_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors block truncate">
                      {task.title}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all opacity-0 group-hover:opacity-100">
                    <ArrowUpRight size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CalendarIcon size={32} className="mb-2 opacity-50" />
                <p className="text-sm italic">Sua agenda está livre hoje.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 soft-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-3 text-slate-800 dark:text-white">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                <FileText size={20} />
              </div>
              Prazos Pendentes
            </h3>
            <button
              onClick={() => navigate('/prazos')}
              className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-widest hover:underline transition-all"
            >
              Gerenciar
            </button>
          </div>
          <div className="space-y-2">
            {deadlines.filter((d: any) => d.status === 'pendente').length >
            0 ? (
              deadlines
                .filter((d: any) => d.status === 'pendente')
                .slice(0, 4)
                .map((deadline: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDeadline(deadline)}
                    className="w-full flex items-center gap-4 p-3 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-900/30 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-50 dark:bg-orange-900/20 text-orange-500 shrink-0 group-hover:scale-110 transition-transform">
                      <Clock size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors">
                        {deadline.title}
                      </h4>
                      <p className="text-xs text-slate-400 group-hover:text-slate-500">
                        {new Date(deadline.deadline_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-all opacity-0 group-hover:opacity-100">
                      <ArrowUpRight size={16} />
                    </div>
                  </button>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Clock size={32} className="mb-2 opacity-50" />
                <p className="text-sm italic">Nenhum prazo pendente.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={() => {
          setSelectedEvent(null);
          navigate('/agenda');
        }}
        onDelete={async (id) => {
          await scheduleService.deleteSchedule(id);
          setSelectedEvent(null);
        }}
        onStatusUpdate={async (id, s) => {
          await scheduleService.updateSchedule(id, { status: s });
          setSelectedEvent(null);
        }}
      />

      <DeadlineDetailsModal
        isOpen={!!selectedDeadline}
        deadline={selectedDeadline}
        onClose={() => setSelectedDeadline(null)}
        onEdit={() => {
          navigate('/prazos');
        }}
        onDelete={async (id) => {
          await deadlineService.deleteDeadline(id);
          setSelectedDeadline(null);
        }}
        onToggleStatus={async (id) => {
          const d = deadlines.find((x: any) => x.id === id);
          await deadlineService.updateDeadline(id, {
            status: d.status === 'concluído' ? 'pendente' : 'concluído',
          });
          setSelectedDeadline(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
