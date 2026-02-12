import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { useTasks } from '../hooks/useQueries';
import { taskService, Task } from '../services/taskService';
import { useApp } from '../contexts/AppContext';

const Tasks: React.FC = () => {
  const { lawyer } = useApp();
  const { data: tasks = [], isLoading, refetch } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'todos' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (a.status === 'concluído' && b.status !== 'concluído') return 1;
        if (a.status !== 'concluído' && b.status === 'concluído') return -1;
        return (
          new Date(a.due_date || '').getTime() -
          new Date(b.due_date || '').getTime()
        );
      });
  }, [tasks, searchTerm, statusFilter]);

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'concluído' ? 'pendente' : 'concluído';
    await taskService.updateTask(task.id, {
      status: newStatus,
      completed_at:
        newStatus === 'concluído' ? new Date().toISOString() : undefined,
    });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta tarefa?')) {
      await taskService.deleteTask(id);
      refetch();
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !lawyer) return;

    await taskService.createTask({
      office_id: lawyer.office_id,
      lawyer_id: lawyer.id,
      title: newTaskTitle,
      status: 'pendente',
      priority: 'média',
    });
    setNewTaskTitle('');
    setIsAdding(false);
    refetch();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
            <span>Escritório</span>
            <ChevronRight size={10} />
            <span className="text-primary-600">Tarefas</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Gerenciamento de Tarefas
          </h1>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          <Plus size={20} /> Nova Tarefa
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-navy-800/50 p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-navy-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'pendente', 'em_andamento', 'concluído'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 dark:bg-navy-800 text-slate-500'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isAdding && (
        <form
          onSubmit={handleAddTask}
          className="bg-white dark:bg-navy-800/50 p-6 rounded-3xl border-2 border-primary-500 shadow-xl animate-in slide-in-from-top-4 duration-300"
        >
          <input
            autoFocus
            type="text"
            placeholder="O que precisa ser feito?"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-transparent text-xl font-bold outline-none border-b-2 border-slate-100 dark:border-white/10 pb-2 mb-4"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-slate-500 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Carregando tarefas...
          </p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-4 p-4 bg-white dark:bg-navy-800/50 border border-slate-200 dark:border-white/10 rounded-3xl group hover:shadow-md transition-all ${task.status === 'concluído' ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => handleToggleStatus(task)}
                className={`transition-colors ${task.status === 'concluído' ? 'text-green-500' : 'text-slate-300 hover:text-primary-500'}`}
              >
                {task.status === 'concluído' ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Circle size={24} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <h3
                  className={`font-bold transition-all ${task.status === 'concluído' ? 'line-through text-slate-500' : 'text-slate-800 dark:text-white'}`}
                >
                  {task.title}
                </h3>
                {task.due_date && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <Clock size={12} />
                    <span>
                      Vence em: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-navy-800/50 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
          <ListTodo size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium font-serif italic text-lg">
            Parece que você está em dia com tudo! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
