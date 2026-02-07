import React, { useState } from 'react';
import {
  X,
  Edit,
  Archive,
  FileText,
  Clock,
  Users,
  DollarSign,
  Files,
  History,
  Loader2,
  Trash2,
} from 'lucide-react';
import { CaseStatus } from '../../types.ts';
import { InfoTab } from './tabs/InfoTab.tsx';
import { DeadlinesTab } from './tabs/DeadlinesTab.tsx';
import { SchedulesTab } from './tabs/SchedulesTab.tsx';
import { FinanceTab } from './tabs/FinanceTab.tsx';
import { DocumentsTab } from './tabs/DocumentsTab.tsx';
import { HistoryTab } from './tabs/HistoryTab.tsx';
import { caseService } from '../../services/caseService.ts';
import { CaseFormModal } from './CaseFormModal.tsx';
import { useCase } from '../../hooks/useQueries';

interface CaseDetailsModalProps {
  caseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseDetailsModal: React.FC<CaseDetailsModalProps> = ({
  caseId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('Informações');
  const { data: caseData, isLoading, refetch } = useCase(caseId);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;

  if (isLoading || !caseData) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary-600" size={40} />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Carregando detalhes...
          </p>
        </div>
      </div>
    );
  }

  const handleArchive = async () => {
    if (
      caseData &&
      confirm(`Deseja arquivar o processo ${caseData.process_number}?`)
    ) {
      await caseService.updateCase(caseData.id, {
        status: CaseStatus.ARQUIVADO,
      });
      refetch();
    }
  };

  const handleDelete = async () => {
    if (
      caseData &&
      confirm(
        `Tem certeza que deseja EXCLUIR PERMANENTEMENTE o processo ${caseData.process_number}? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await caseService.deleteCase(caseData.id);
        onClose();
        // Optional: Force a window reload or use queryClient to invalidate 'cases' query if available in context
        // For now, relies on React Query's refetchOnWindowFocus or manual refetch in parent
        window.location.reload(); // Simple brute force to ensure list updates, or can rely on parent
      } catch (error) {
        console.error('Erro ao excluir:', error);
        alert('Erro ao excluir processo.');
      }
    }
  };

  const tabs = [
    { name: 'Informações', icon: <FileText size={16} /> },
    { name: 'Prazos', icon: <Clock size={16} /> },
    { name: 'Audiências', icon: <Users size={16} /> },
    { name: 'Financeiro', icon: <DollarSign size={16} /> },
    { name: 'Documentos', icon: <Files size={16} /> },
    { name: 'Histórico', icon: <History size={16} /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Informações':
        return <InfoTab caseData={caseData} />;
      case 'Prazos':
        return <DeadlinesTab caseId={caseData.id} />;
      case 'Audiências':
        return <SchedulesTab caseId={caseData.id} />;
      case 'Financeiro':
        return <FinanceTab caseId={caseData.id} />;
      case 'Documentos':
        return <DocumentsTab caseId={caseData.id} />;
      case 'Histórico':
        return <HistoryTab caseId={caseData.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-stretch md:items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-6xl md:h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold dark:text-white tracking-tight">
                {caseData.process_number}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
                {caseData.status}
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Cliente {caseData.client?.name || 'ID ' + caseData.client_id} •{' '}
              {caseData.court}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Edit size={16} />
              Editar
            </button>
            <button
              onClick={handleArchive}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <Archive size={16} />
              Arquivar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900/50 rounded-xl font-bold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <Trash2 size={16} />
              Excluir
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-500"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8 px-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-2 py-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.name
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto h-full">{renderTabContent()}</div>
        </div>
      </div>

      <CaseFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={caseData}
        onSave={async (data) => {
          await caseService.updateCase((caseData as any).id, data);
          setIsEditModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};
