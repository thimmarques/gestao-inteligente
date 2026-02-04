
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Folder, Clock, DollarSign, ArrowUpRight, ArrowDownRight,
  TrendingUp, BarChart3, Loader2
} from 'lucide-react';
import {
  CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import { TeamWidget } from '../components/dashboard/TeamWidget';
import { CriticalLogsWidget } from '../components/dashboard/CriticalLogsWidget';
import { useApp } from '../contexts/AppContext';
import { EventDetailsModal } from '../components/schedule/EventDetailsModal';
import { DeadlineDetailsModal } from '../components/deadlines/DeadlineDetailsModal';
import { scheduleService } from '../services/scheduleService';
import { deadlineService } from '../services/deadlineService';
import { useClients, useCases, useDeadlines, useFinances, useSchedules } from '../hooks/useQueries';

const KPICard = ({ label, value, trend, isPositive, icon, sub, onClick }: any) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-left hover:scale-[1.02] transition-all hover:shadow-md group"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 transition-colors">{icon}</div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</h3>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="text-2xl font-bold dark:text-white">{value}</span>
    </div>
    <p className="text-xs text-slate-400 mt-2">{sub}</p>
  </button>
);

const Dashboard: React.FC = () => {
  const { lawyer } = useApp();
  const navigate = useNavigate();

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

    const urgentDeadlines = deadlines.filter((d: any) => d.status === 'pendente' && d.priority === 'urgente').length;

    const today = new Date().toDateString();
    const todaySchedules = schedules
      .filter((s: any) => s.status === 'agendado' && new Date(s.start_time).toDateString() === today)
      .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return { revenueThisMonth, urgentDeadlines, todaySchedules };
  }, [finances, deadlines, schedules]);

  const isLoading = loadingClients || loadingCases || loadingDeadlines || loadingFinances || loadingSchedules;

  const statsCards = [
    { label: 'Clientes Ativos', value: clients.filter((c: any) => c.status === 'ativo').length, trend: '0%', isPositive: true, icon: <Users className="text-blue-500" />, sub: `${clients.filter((c: any) => c.type === 'particular').length} Particulares`, path: '/clientes' },
    { label: 'Processos', value: cases.length, trend: '0', isPositive: true, icon: <Folder className="text-indigo-500" />, sub: 'Em andamento', path: '/processos' },
    { label: 'Prazos Pendentes', value: deadlines.filter((d: any) => d.status === 'pendente').length, trend: `${stats.urgentDeadlines} urgentes`, isPositive: false, icon: <Clock className="text-orange-500" />, sub: 'Monitorados', path: '/prazos' },
    { label: 'Receita do Mês', value: formatCurrency(stats.revenueThisMonth), trend: '0%', isPositive: true, icon: <DollarSign className="text-green-500" />, sub: 'Efetivado', path: '/financeiro' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Carregando painel estratégico...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10 animate-in fade-in duration-500 pb-24 text-slate-900 dark:text-slate-100">
      <header className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">Bom dia, Dr. {lawyer?.name || 'Advogado'}</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Resumo estratégico do seu escritório.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <KPICard
            key={i}
            {...stat}
            onClick={() => navigate(stat.path)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-lg tracking-tight flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-500" /> Histórico de Receita
            </h3>
          </div>
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
            {finances.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finances.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center italic space-y-2">
                <BarChart3 size={40} className="mx-auto opacity-20" />
                <p>Nenhum dado financeiro vinculado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TeamWidget />
          {lawyer?.role === 'admin' && <CriticalLogsWidget />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Agenda Hoje</h3>
            <button onClick={() => navigate('/agenda')} className="text-xs font-bold text-primary-600 uppercase hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {stats.todaySchedules.length > 0 ? (
              stats.todaySchedules.slice(0, 5).map((task: any, i: number) => (
                <button key={i} onClick={() => setSelectedEvent(task)} className="w-full flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left">
                  <div className="text-sm font-bold text-slate-400 shrink-0">
                    {new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold group-hover:text-primary-600 transition-colors block truncate">{task.title}</span>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic py-4 text-center">Sem eventos para hoje.</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Prazos Ativos</h3>
            <button onClick={() => navigate('/prazos')} className="text-xs font-bold text-primary-600 uppercase hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4">
            {deadlines.filter((d: any) => d.status === 'pendente').length > 0 ? (
              deadlines.filter((d: any) => d.status === 'pendente').slice(0, 3).map((deadline: any, i: number) => (
                <button key={i} onClick={() => setSelectedDeadline(deadline)} className="w-full flex items-center gap-4 p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100 text-orange-600 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{deadline.title}</h4>
                    <p className="text-xs text-slate-500">{new Date(deadline.deadline_date).toLocaleDateString()}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic py-4 text-center">Nenhum prazo pendente.</p>
            )}
          </div>
        </div>
      </div>

      <EventDetailsModal
        isOpen={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={() => { setSelectedEvent(null); navigate('/agenda'); }}
        onDelete={async (id) => { await scheduleService.deleteSchedule(id); setSelectedEvent(null); }}
        onStatusUpdate={async (id, s) => { await scheduleService.updateSchedule(id, { status: s }); setSelectedEvent(null); }}
      />

      <DeadlineDetailsModal
        isOpen={!!selectedDeadline}
        deadline={selectedDeadline}
        onClose={() => setSelectedDeadline(null)}
        onEdit={() => { navigate('/prazos'); }}
        onDelete={async (id) => { await deadlineService.deleteDeadline(id); setSelectedDeadline(null); }}
        onToggleStatus={async (id) => {
          const d = deadlines.find((x: any) => x.id === id);
          await deadlineService.updateDeadline(id, { status: d.status === 'concluído' ? 'pendente' : 'concluído' });
          setSelectedDeadline(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
