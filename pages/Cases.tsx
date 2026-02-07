import React, { useState, useMemo } from 'react';
import {
  Folder,
  Plus,
  Search,
  Filter,
  Loader2,
  MoreVertical,
  ExternalLink,
  Clock,
  User,
  Hash,
  Tag,
  Scale,
  Edit2,
} from 'lucide-react';
import { useCases } from '../hooks/useQueries';
import { caseService } from '../services/caseService';
import { CaseWithRelations, Case } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CaseFormModal } from '../components/cases/CaseFormModal';
import { CaseDetailsModal } from '../components/cases/CaseDetailsModal';
import { useAuth } from '../contexts/AuthContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'distribuído':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
    case 'andamento':
      return 'bg-green-100 text-green-600 dark:bg-green-900/30';
    case 'sentenciado':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30';
    case 'arquivado':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const Cases: React.FC = () => {
  const { user } = useAuth();
  const { data: cases = [], isLoading, refetch } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const handleCreate = () => {
    setSelectedCase(null);
    setIsFormOpen(true);
  };

  const handleEdit = (c: Case) => {
    setSelectedCase(c);
    setIsFormOpen(true);
  };

  const handleDetails = (c: Case) => {
    setSelectedCase(c);
    setIsDetailsOpen(true);
  };

  const handleSave = async (data: any) => {
    if (!user) return;

    try {
      if (selectedCase) {
        await caseService.updateCase(selectedCase.id, data);
      } else {
        await caseService.createCase({
          ...data,
          office_id: user.office_id,
          lawyer_id: user.id,
        });
      }
      await refetch();
      setIsFormOpen(false);
      setSelectedCase(null);
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Erro ao salvar processo. Verifique os dados.');
    }
  };

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.process_number.includes(searchTerm) ||
        c.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.court.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'todos' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [cases, searchTerm, statusFilter]);

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Processos</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Gerenciamento de {cases.length} processos judiciais.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/20 transition-all active:scale-95"
        >
          <Plus size={20} /> Novo Processo
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Nº processo, cliente ou tribunal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['todos', 'distribuído', 'andamento', 'sentenciado', 'recurso'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${statusFilter === s ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-500'}`}
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Carregando processos...
          </p>
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-x-1 transition-all group relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold font-mono">
                      <Hash size={14} /> {c.process_number}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(c.status)}`}
                    >
                      {c.status}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-bold capitalize">
                      <Scale size={14} className="text-primary-500" /> {c.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Cliente
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <User size={14} className="text-primary-500" />{' '}
                        {c.client?.name || 'Não vinculado'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Tribunal / Vara
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {c.court}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Valor da Causa
                      </p>
                      <p className="text-sm font-black text-primary-600">
                        {formatCurrency(c.value)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Iniciado em
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />{' '}
                        {new Date(c.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {c.tags && c.tags.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-400 rounded-full border border-slate-100 dark:border-slate-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex md:flex-col gap-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex-1 md:flex-none p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                    title="Editar Processo"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDetails(c)}
                    className="flex-1 md:flex-none p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    title="Ver Detalhes"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800">
          <Folder size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-medium font-serif italic text-lg">
            Nenhum processo em andamento.
          </p>
        </div>
      )}

      {/* Modal para Criar/Editar Processo */}
      <CaseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCase(null);
        }}
        onSave={handleSave}
        initialData={selectedCase}
      />

      {/* Modal de Detalhes do Processo */}
      <CaseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCase(null);
        }}
        caseId={selectedCase?.id || null}
      />
    </div>
  );
};

export default Cases;
