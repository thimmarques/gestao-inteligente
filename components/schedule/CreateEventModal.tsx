import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Gavel,
  Users,
  Clock,
  Calendar,
  Save,
  Loader2,
  Clock3,
  Video,
  MapPin,
} from 'lucide-react';
import { useCases, useClients } from '../../hooks/useQueries';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultCaseId?: string;
  mode?: 'create' | 'edit';
  onSave?: (event: any) => void;
  initialData?: any;
}

type EventType = 'audiência' | 'reunião' | 'prazo' | 'compromisso';

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultCaseId,
  mode = 'create',
  onSave,
  initialData,
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
    startTime: '11:00',
    endTime: '12:00',
    description: '',
    isVirtual: false,
    location: '',
    syncGoogle: false,
    reminders: {
      oneDayBefore: true,
      oneHourBefore: true,
      customValue: 15,
      customUnit: 'minutos',
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        processListRef.current &&
        !processListRef.current.contains(event.target as Node)
      ) {
        setShowProcessList(false);
      }
      if (
        clientListRef.current &&
        !clientListRef.current.contains(event.target as Node)
      ) {
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
          startTime: start.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          endTime: end.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          description: initialData.description || '',
          isVirtual: !!initialData.virtual_link,
          location: initialData.location || '',
          syncGoogle: !!initialData.google_event_id,
          reminders: {
            oneDayBefore: true,
            oneHourBefore: true,
            customValue: 15,
            customUnit: 'minutos',
          },
        });
      } else {
        const initialDateStr = defaultDate
          ? defaultDate.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        setFormData({
          type: 'audiência',
          title: '',
          case_id: defaultCaseId || '',
          client_id: '',
          date: initialDateStr,
          startTime: '11:00',
          endTime: '12:00',
          description: '',
          isVirtual: false,
          location: '',
          syncGoogle: false,
          reminders: {
            oneDayBefore: true,
            oneHourBefore: true,
            customValue: 15,
            customUnit: 'minutos',
          },
        });
      }
    }
  }, [isOpen, initialData, mode, defaultDate, defaultCaseId]);

  const eventTypes = [
    {
      id: 'audiência',
      label: 'AUDIÊNCIA',
      icon: Gavel,
      activeColor: 'bg-[#C22E2E]',
      hoverColor: 'hover:bg-[#C22E2E]/10',
      activeBorder: 'border-[#C22E2E]',
      activeText: 'text-white',
      inactiveText: 'text-[#C22E2E]',
      placeholder: 'Ex: Audiência de Instrução',
    },
    {
      id: 'reunião',
      label: 'REUNIÃO',
      icon: Users,
      activeColor: 'bg-[#2E5BC2]',
      hoverColor: 'hover:bg-[#2E5BC2]/10',
      activeBorder: 'border-[#2E5BC2]',
      activeText: 'text-white',
      inactiveText: 'text-[#2E5BC2]',
      placeholder: 'Ex: Reunião com cliente',
    },
    {
      id: 'prazo',
      label: 'PRAZO',
      icon: Clock,
      activeColor: 'bg-[#C28C2E]',
      hoverColor: 'hover:bg-[#C28C2E]/10',
      activeBorder: 'border-[#C28C2E]',
      activeText: 'text-white',
      inactiveText: 'text-[#C28C2E]',
      placeholder: 'Ex: Prazo para contestação',
    },
    {
      id: 'compromisso',
      label: 'COMPROMISSO',
      icon: Calendar,
      activeColor: 'bg-[#822EC2]',
      hoverColor: 'hover:bg-[#822EC2]/10',
      activeBorder: 'border-[#822EC2]',
      activeText: 'text-white',
      inactiveText: 'text-[#822EC2]',
      placeholder: 'Ex: Compromisso pessoal',
    },
  ];

  const filteredCases = useMemo(() => {
    if (!searchProcess) return cases.slice(0, 5);
    return (cases as any[])
      .filter(
        (c) =>
          c.process_number.includes(searchProcess) ||
          (c.court &&
            c.court.toLowerCase().includes(searchProcess.toLowerCase()))
      )
      .slice(0, 10);
  }, [cases, searchProcess]);

  const filteredClients = useMemo(() => {
    if (!searchClient) return clients.slice(0, 5);
    return (clients as any[])
      .filter(
        (c) =>
          c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
          c.cpf_cnpj.includes(searchClient)
      )
      .slice(0, 10);
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

  return createPortal(
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-[#0B0F1A]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#111827] w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/5 flex flex-col animate-in slide-in-from-bottom-8 duration-500 max-h-[95vh]">
        <div className="px-8 py-4 border-b border-white/5 bg-[#111827] flex items-center justify-between">
          <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em]">
            {mode === 'create' ? 'Novo Evento' : 'Editar Evento'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30"
          >
            <X size={20} />
          </button>
        </div>

        <form
          id="create-event-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-10"
        >
          {/* Header/Event Types */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Tipo de Evento
            </label>
            <div className="grid grid-cols-4 gap-3">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              const isActive = formData.type === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, type: type.id as EventType })
                  }
                  className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[1.5rem] border-2 transition-all duration-300 ${isActive ? `${type.activeBorder} bg-white/5` : `border-transparent bg-white/5 ${type.hoverColor}`}`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isActive ? type.activeColor : 'bg-white/5'}`}
                  >
                    <Icon size={24} className={isActive ? 'text-white' : type.inactiveText} />
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-[0.1em] ${isActive ? type.inactiveText : 'text-white/40'}`}
                  >
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

          <div className="space-y-8">
            {/* Título */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Título do Evento*
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={
                  eventTypes.find((t) => t.id === formData.type)?.placeholder
                }
                className="w-full px-7 py-5 bg-[#1F2937] border-none rounded-[1.5rem] focus:ring-2 focus:ring-primary-500 text-white text-xl font-bold placeholder:text-white/20 outline-none transition-all"
              />
            </div>

            {/* Estilo e Endereço */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Estilo da Audiência / Reunião
              </label>
              <div className="p-1 px-1 bg-[#1F2937] rounded-[1.2rem] flex gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVirtual: false })}
                  className={`flex-1 py-3.5 rounded-[1rem] flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-all ${!formData.isVirtual ? 'bg-white/10 text-primary-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  <MapPin size={14} />
                  PRESENCIAL
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isVirtual: true })}
                  className={`flex-1 py-3.5 rounded-[1rem] flex items-center justify-center gap-2 text-[10px] font-black tracking-widest transition-all ${formData.isVirtual ? 'bg-white/10 text-primary-400' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Video size={14} />
                  ONLINE (VIRTUAL)
                </button>
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Endereço ou Localização da Vara"
                className="w-full px-7 py-5 bg-[#1F2937] border-none rounded-[1.5rem] focus:ring-2 focus:ring-primary-500 text-white/80 text-sm placeholder:text-white/20 outline-none transition-all"
              />
            </div>

            {/* Vínculos */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Vínculos
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative" ref={processListRef}>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">Processo</p>
                  <input
                    type="text"
                    value={searchProcess || selectedCase?.process_number || ''}
                    onChange={(e) => {
                      setSearchProcess(e.target.value);
                      setShowProcessList(true);
                    }}
                    onFocus={() => setShowProcessList(true)}
                    placeholder="Buscar processo..."
                    className="w-full px-6 py-4 bg-[#1F2937] border-none rounded-[1.2rem] focus:ring-2 focus:ring-primary-500 text-white text-sm placeholder:text-white/20 shadow-inner outline-none transition-all h-[56px]"
                  />
                  {showProcessList && filteredCases.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1F2937] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                      {filteredCases.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, case_id: c.id });
                            setShowProcessList(false);
                            setSearchProcess('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                        >
                          <p className="text-xs font-bold text-white">
                            {c.process_number}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative" ref={clientListRef}>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">Cliente</p>
                  <input
                    type="text"
                    value={searchClient || selectedClient?.name || ''}
                    onChange={(e) => {
                      setSearchClient(e.target.value);
                      setShowClientList(true);
                    }}
                    onFocus={() => setShowClientList(true)}
                    placeholder="Buscar cliente..."
                    className="w-full px-6 py-4 bg-[#1F2937] border-none rounded-[1.2rem] focus:ring-2 focus:ring-primary-500 text-white text-sm placeholder:text-white/20 shadow-inner outline-none transition-all h-[56px]"
                  />
                  {showClientList && filteredClients.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1F2937] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                      {filteredClients.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, client_id: c.id });
                            setShowClientList(false);
                            setSearchClient('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                        >
                          <p className="text-xs font-bold text-white">
                            {c.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Data e Hora */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Data e Hora
              </label>
              <div className="bg-[#1F2937]/30 p-8 rounded-[2rem] border border-white/5 grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">Data</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0B0F1A] border-none rounded-[1.2rem] focus:ring-2 focus:ring-primary-500 text-white text-sm outline-none appearance-none"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">Início</label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0B0F1A] border-none rounded-[1.2rem] focus:ring-2 focus:ring-primary-500 text-white text-sm outline-none"
                    />
                    <Clock3 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20">Fim</label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-5 py-4 bg-[#0B0F1A] border-none rounded-[1.2rem] focus:ring-2 focus:ring-primary-500 text-white text-sm outline-none"
                    />
                    <Clock3 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Notas Adicionais
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Pautas da audiência, observações estratégicas..."
                rows={4}
                className="w-full px-7 py-5 bg-[#1F2937] border-none rounded-[1.5rem] focus:ring-2 focus:ring-primary-500 text-white/80 text-sm placeholder:text-white/20 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </form>

        <div className="px-8 py-6 border-t border-white/5 bg-[#111827] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest px-4 py-2"
          >
            Cancelar
          </button>
          <button
            form="create-event-form"
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            SALVAR COMPROMISSO
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
