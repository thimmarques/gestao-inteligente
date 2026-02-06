import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Target,
  Settings,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FocusMode: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [tasks, setTasks] = useState<
    { id: string; title: string; completed: boolean; priority: string }[]
  >([]);

  const navigate = useNavigate();

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsBreak(!isBreak);
      setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
      alert(
        isBreak
          ? 'Pausa terminada! De volta ao trabalho.'
          : 'Hora de uma pausa!'
      );
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = () => {
    const title = prompt('Digite o nome da tarefa:');
    if (title) {
      setTasks([
        ...tasks,
        {
          id: Date.now().toString(),
          title,
          completed: false,
          priority: 'média',
        },
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Sair do Modo Foco
      </button>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Pomodoro */}
        <div className="flex flex-col items-center">
          <div className="mb-8 flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
            <Target className="text-primary-500" size={18} />
            <span className="text-sm font-semibold tracking-wider uppercase">
              {isBreak ? 'Pausa Curta' : 'Foco Total'}
            </span>
          </div>

          <div className="relative flex items-center justify-center mb-12">
            <svg className="w-80 h-80 -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="160"
                cy="160"
                r="150"
                className="stroke-primary-600 transition-all duration-1000"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={942}
                strokeDashoffset={
                  942 - 942 * (timeLeft / (isBreak ? 5 * 60 : 25 * 60))
                }
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-7xl font-bold tracking-tighter tabular-nums">
              {String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={resetTimer}
              className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
            >
              <RotateCcw size={24} />
            </button>
            <button
              onClick={toggleTimer}
              className="w-20 h-20 bg-primary-600 hover:bg-primary-500 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              {isActive ? (
                <Pause size={32} />
              ) : (
                <Play size={32} className="ml-1" />
              )}
            </button>
            <button className="p-4 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors text-slate-400">
              <Settings size={24} />
            </button>
          </div>
        </div>

        {/* Right: Checklist */}
        <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm h-fit min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Objetivos de Hoje</h3>
            <span className="text-sm font-medium text-slate-400">
              {tasks.filter((t) => t.completed).length}/{tasks.length}{' '}
              concluídos
            </span>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-700 opacity-60'
                      : 'bg-slate-800 border-slate-700 hover:border-primary-500 hover:shadow-lg'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="text-primary-500" size={24} />
                  ) : (
                    <Circle
                      className="text-slate-600 group-hover:text-primary-400"
                      size={24}
                    />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}
                    >
                      {task.title}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-slate-500 border border-dashed border-slate-700 rounded-2xl">
                <p className="text-sm italic">
                  Adicione tarefas para manter o foco.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddTask}
            className="w-full mt-8 py-4 rounded-2xl border-2 border-dashed border-slate-700 text-slate-500 font-bold hover:border-primary-500 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Adicionar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
};

export default FocusMode;
