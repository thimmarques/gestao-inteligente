import React, { useState } from 'react';
import { X, Search, Check, Calendar, Globe, Loader2, Info } from 'lucide-react';
import { googleCalendarService } from '../../services/googleCalendarService.ts';
import { supabase } from '../../lib/supabase';

interface ImportGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (events: any[]) => void;
}

export const ImportGoogleModal: React.FC<ImportGoogleModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    setLoading(true);
    const events = await googleCalendarService.listEvents(
      new Date(dateRange.start),
      new Date(dateRange.end)
    );
    setAvailableEvents(events);
    setSelectedIds(events.map((e) => e.id));
    setStep(2);
    setLoading(false);
  };

  const handleImport = async () => {
    setImporting(true);
    const eventsToImport = availableEvents.filter((e) =>
      selectedIds.includes(e.id)
    );

    try {
      const uId = await googleCalendarService.getUserId();
      if (!uId) throw new Error('User session not found');

      // Import events to local database
      for (const event of eventsToImport) {
        const start = encodeURIComponent(
          event.start.dateTime || event.start.date
        );
        const end = encodeURIComponent(event.end.dateTime || event.end.date);

        await supabase.from('schedules').insert({
          title: event.summary || 'Sem título',
          description: event.description || '',
          type: 'reuniao',
          lawyer_id: uId,
          status: 'agendado',
          start_time: new Date(
            event.start.dateTime || event.start.date
          ).toISOString(),
          end_time: new Date(
            event.end.dateTime || event.end.date
          ).toISOString(),
          google_event_id: event.id,
        });
      }

      onImportComplete(eventsToImport);
      alert(`${eventsToImport.length} eventos importados com sucesso!`);
    } catch (error) {
      console.error('Error importing events:', error);
      alert('Erro ao importar eventos.');
    } finally {
      setImporting(false);
      onClose();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === availableEvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableEvents.map((e) => e.id));
    }
  };

  const toggleEvent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 pt-10 pb-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary-600">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white tracking-tight">
                  Importar do Google
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Sincronize sua agenda externa com o LegalTech.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar max-h-[60vh]">
          {step === 1 ? (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-primary-500" /> Período de
                  Busca
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                      Início
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                      Fim
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-800 flex gap-4">
                <Info className="text-primary-600 shrink-0" size={20} />
                <p className="text-sm text-primary-900 dark:text-primary-300 font-medium leading-relaxed">
                  O LegalTech buscará todos os eventos públicos e privados da
                  sua conta Google principal no período selecionado.
                </p>
              </div>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Search size={24} />
                )}
                {loading ? 'Buscando Eventos...' : 'Ver Eventos Disponíveis'}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {availableEvents.length} eventos encontrados
                </h3>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      selectedIds.length === availableEvents.length
                        ? 'bg-primary-600 border-primary-600'
                        : 'border-slate-200 dark:border-slate-700 group-hover:border-primary-400'
                    }`}
                  >
                    {selectedIds.length === availableEvents.length && (
                      <Check size={12} className="text-white" strokeWidth={4} />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Selecionar Todos
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                {availableEvents.map((event) => {
                  const isSelected = selectedIds.includes(event.id);
                  const date = new Date(event.start.dateTime);
                  return (
                    <div
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`flex items-center gap-4 p-4 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && (
                          <Check
                            size={10}
                            className="text-white"
                            strokeWidth={4}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold dark:text-white truncate">
                          {event.summary}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {date.toLocaleDateString('pt-BR')} às{' '}
                          {date.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>

          {step === 2 && (
            <button
              onClick={handleImport}
              disabled={importing || selectedIds.length === 0}
              className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95"
            >
              {importing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Check size={20} />
              )}
              Importar {selectedIds.length} Selecionados
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
