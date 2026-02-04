
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, Gavel, Users, Clock, Calendar, Check,
  Search, ChevronDown, Save, Loader2, AlertCircle,
  Clock3, Video, MapPin, Paperclip, Mail, Bell,
  Plus, Trash2, Globe, FileText, Briefcase, User
} from 'lucide-react';
import { useCases, useClients } from '../../hooks/useQueries';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultCaseId?: string;
  mode?: 'create' | 'edit';
  eventId?: string;
  onSave?: (event: any) => void;
  initialData?: any;
}

type EventType = 'audiência' | 'reunião' | 'prazo' | 'compromisso';

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen, onClose, defaultDate, defaultCaseId, mode = 'create', eventId, onSave, initialData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: cases = [] } = useCases();
  const { data: clients = [] } = useClients();

  const [searchProcess, setSearchProcess] = useState('');
  const [searchClient, setSearchClient] = useState('');
  const [showProcessList, setShowProcessList] = useState(false);
  const [showClientList, setShowClientList] = useState(false);

  const processListRef = useRef<HTMLDivElement>(null);
  const clientListRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    type: 'audiência' as EventType,
    title: '',
    case_id: '',
    client_id: '',
    date: '',
    startTime: '15:00',
    endTime: '16:00',
    description: '',
    isVirtual: false,
    syncGoogle: false,
    reminders: {
      oneDayBefore: true,
      oneHourBefore: true,
      customValue: 15,
      customUnit: 'minutos'
    }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (processListRef.current && !processListRef.current.contains(event.target as Node)) {
        setShowProcessList(false);
      }
      if (clientListRef.current && !clientListRef.current.contains(event.target as Node)) {
        setShowClientList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (initialData && (mode === 'edit' || initialData.id)) {
        const start = new Date(initialData.start_time || initialData.start);
        const end = new Date(initialData.end_time || initialData.end);

        setFormData({
          type: initialData.type || 'audiência',
          title: initialData.title || '',
          case_id: initialData.case_id || '',
          client_id: initialData.client_id || '',
          date: start.toISOString().split('T')[0],
          startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: initialData.description || '',
          isVirtual: !!initialData.virtual_link,
          syncGoogle: !!initialData.google_event_id,
          reminders: {
            oneDayBefore: true,
            oneHourBefore: true,
            customValue: 15,
            customUnit: 'minutos'
          }
        });
      } else {
        const initialDateStr = defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentHour = now.getHours();
        const nextHour = (currentHour + 1).toString().padStart(2, '0') + ':00';
        const endHour = (currentHour + 2).toString().padStart(2, '0') + ':00';

        setFormData({
          type: 'audiência',
          title: '',
          case_id: defaultCaseId || '',
          client_id: '',
          date: initialDateStr,
          startTime: nextHour,
          endTime: endHour,
          description: '',
          isVirtual: false,
          syncGoogle: false,
          reminders: {
            oneDayBefore: true,
            oneHourBefore: true,
            customValue: 15,
            customUnit: 'minutos'
          }
        });
      }
    }
  }, [isOpen, initialData, mode, defaultDate, defaultCaseId]);

  const eventTypes = [
    { id: 'audiência', label: 'Audiência', icon: Gavel, color: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-600', placeholder: 'Ex: Audiência de Instrução' },
    { id: 'reunião', label: 'Reunião', icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600', placeholder: 'Ex: Reunião com cliente' },
    { id: 'prazo', label: 'Prazo', icon: Clock, color: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600', placeholder: 'Ex: Prazo para contestação' },
    { id: 'compromisso', label: 'Compromisso', icon: Calendar, color: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600', placeholder: 'Ex: Compromisso pessoal' },
  ];

  const filteredCases = useMemo(() => {
    if (!searchProcess) return cases.slice(0, 5);
    return (cases as any[]).filter(c =>
      c.process_number.includes(searchProcess) ||
      (c.court && c.court.toLowerCase().includes(searchProcess.toLowerCase()))
    ).slice(0, 10);
  }, [cases, searchProcess]);

  const filteredClients = useMemo(() => {
    if (!searchClient) return clients.slice(0, 5);
    return (clients as any[]).filter(c =>
      c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      c.cpf_cnpj.includes(searchClient)
    ).slice(0, 10);
  }, [clients, searchClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCase = cases.find((c: any) => c.id === formData.case_id);
  const selectedClient = clients.find((c: any) => c.id === formData.client_id);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]">

        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black dark:text-white tracking-tight">
                {mode === 'create' ? 'Novo Evento' : 'Editar Evento'}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Configure o compromisso.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>
        </div>

        <form id="create-event-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar pb-32">
          <section className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Tipo de Compromisso</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {eventTypes.map((type) => {
                  const Icon = type.icon;
                  const isActive = formData.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id as EventType })}
                      className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all relative group ${isActive ? `${type.border} ${type.bg} scale-[1.02] shadow-lg` : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${type.color}`}><Icon size={20} /></div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? type.text : 'text-slate-400'}`}>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Título do Evento</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={eventTypes.find(t => t.id === formData.type)?.placeholder}
                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-primary-500 dark:text-white text-xl font-bold placeholder:text-slate-400 shadow-inner outline-none transition-all"
              />
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Vínculos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 relative" ref={processListRef}>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Processo</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchProcess || (selectedCase?.process_number || '')}
                    onChange={(e) => { setSearchProcess(e.target.value); setShowProcessList(true); }}
                    onFocus={() => setShowProcessList(true)}
                    placeholder="Buscar processo..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono shadow-inner outline-none transition-all"
                  />
                </div>
                {showProcessList && filteredCases.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredCases.map((c: any) => (
                      <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, case_id: c.id }); setShowProcessList(false); setSearchProcess(''); }} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                        <p className="text-xs font-bold dark:text-white">{c.process_number}</p>
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest">{c.court}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 relative" ref={clientListRef}>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Cliente</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Users size={16} />
                  </div>
                  <input
                    type="text"
                    value={searchClient || (selectedClient?.name || '')}
                    onChange={(e) => { setSearchClient(e.target.value); setShowClientList(true); }}
                    onFocus={() => setShowClientList(true)}
                    placeholder="Buscar cliente..."
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-inner outline-none transition-all"
                  />
                </div>
                {showClientList && filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {filteredClients.map((c: any) => (
                      <button key={c.id} type="button" onClick={() => { setFormData({ ...formData, client_id: c.id }); setShowClientList(false); setSearchClient(''); }} className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors">
                        <p className="text-xs font-bold dark:text-white">{c.name}</p>
                        <p className="text-[9px] text-slate-400 tracking-widest">{c.cpf_cnpj}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Data e Hora</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Data</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Início</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-sm outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Fim</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm shadow-sm outline-none"
                />
              </div>
            </div>
          </section>
        </form>

        <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-20 flex items-center justify-between">
          <button type="button" onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancelar</button>
          <button
            form="create-event-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-3 px-12 py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all shadow-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-primary-500/30 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Evento
          </button>
        </div>
      </div>
    </div>
  );
};
