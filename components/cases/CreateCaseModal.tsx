
import React, { useState } from 'react';
import { X, Save, Search } from 'lucide-react';
import { CaseStatus, CaseType } from '../../types.ts';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    process_number: '',
    court: '',
    type: 'cível',
    status: 'distribuído',
    value: '',
    started_at: new Date().toISOString().split('T')[0],
    tags: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCase = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      value: Number(formData.value) || 0,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('legaltech_cases') || '[]');
    localStorage.setItem('legaltech_cases', JSON.stringify([...existing, newCase]));
    
    onClose();
    alert("Processo cadastrado!");
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold dark:text-white">Novo Processo</h2>
            <p className="text-sm text-slate-500">Cadastre os dados básicos do caso (opcionais).</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Cliente</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  placeholder="Buscar cliente..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={formData.client_id}
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Número do Processo</label>
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white font-mono"
                value={formData.process_number}
                onChange={e => setFormData({...formData, process_number: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Tribunal/Vara</label>
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.court}
                onChange={e => setFormData({...formData, court: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Tipo</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as any})}
              >
                <option value="cível">Cível</option>
                <option value="trabalhista">Trabalhista</option>
                <option value="criminal">Criminal</option>
                <option value="família">Família</option>
                <option value="tributário">Tributário</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Status</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="distribuído">Distribuído</option>
                <option value="andamento">Andamento</option>
                <option value="sentenciado">Sentenciado</option>
                <option value="recurso">Recurso</option>
                <option value="arquivado">Arquivado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Valor da Causa (R$)</label>
              <input 
                type="number"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.value}
                onChange={e => setFormData({...formData, value: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Data de Início</label>
              <input 
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.started_at}
                onChange={e => setFormData({...formData, started_at: e.target.value})}
              />
            </div>

            <div className="col-span-full">
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Tags</label>
              <input 
                placeholder="ex: urgente, liminar, contestação"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
              />
            </div>

            <div className="col-span-full">
              <label className="text-sm font-medium dark:text-slate-300 mb-1.5 block">Notas</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white resize-none"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </form>

        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20"
          >
            <Save size={18} />
            Salvar Processo
          </button>
        </div>
      </div>
    </div>
  );
};
