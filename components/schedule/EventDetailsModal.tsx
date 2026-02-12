import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Video,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  User,
  Briefcase,
  FileText,
  Globe,
  Loader2,
} from 'lucide-react';
import { ScheduleEvent } from '../../types';
import { getEventColor, getEventIcon } from '../../utils/eventColors';

interface EventDetailsModalProps {
  event: ScheduleEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: ScheduleEvent) => void;
  onDelete: (id: string) => Promise<void>;
  onStatusUpdate: (
    id: string,
    status: ScheduleEvent['status']
  ) => Promise<void>;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusUpdate,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  if (!isOpen || !event) return null;

  const color = getEventColor(event.type, event.status);
  const Icon = getEventIcon(event.type);
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const durationMinutes =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60);
  const durationText =
    durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60 > 0 ? (durationMinutes % 60) + 'min' : ''}`
      : `${durationMinutes} minutos`;

  const handleDelete = async () => {
    if (
      confirm(
        'Tem certeza que deseja deletar este evento permanentemente? Esta ação não pode ser desfeita.'
      )
    ) {
      setIsDeleting(true);
      try {
        await onDelete(event.id);
      } catch (error) {
        console.error('Erro ao deletar evento:', error);
      } finally {
        setIsDeleting(false);
        onClose();
      }
    }
  };

  const handleToggleComplete = async () => {
    setIsUpdatingStatus(true);
    const newStatus = event.status === 'concluído' ? 'agendado' : 'concluído';
    try {
      await onStatusUpdate(event.id, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    } finally {
      setIsUpdatingStatus(false);
      onClose();
    }
  };

  const handleCancel = async () => {
    if (confirm('Deseja marcar este evento como cancelado?')) {
      setIsUpdatingStatus(true);
      try {
        await onStatusUpdate(event.id, 'cancelado');
      } catch (error) {
        console.error('Erro ao cancelar evento:', error);
      } finally {
        setIsUpdatingStatus(false);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-navy-800/50 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header Color Strip */}
        <div className="h-2 w-full" style={{ backgroundColor: color }}></div>

        {/* Header Actions */}
        <div className="px-8 pt-8 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              <Icon size={24} />
            </div>
            <div>
              <span
                className="text-[10px] font-black uppercase tracking-widest opacity-60 dark:text-white"
                style={{ color: color }}
              >
                {event.type}
              </span>
              <h2 className="text-xl font-bold dark:text-white leading-tight">
                {event.title}
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(event)}
              className="p-2.5 bg-slate-50 dark:bg-navy-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-600 rounded-xl transition-all"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2.5 bg-slate-50 dark:bg-navy-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
            >
              {isDeleting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Trash2 size={20} />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${event.status === 'agendado' ? 'bg-blue-500' : event.status === 'concluído' ? 'bg-green-500' : 'bg-slate-400'}`}
              />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                Status: {event.status}
              </span>
            </div>
            {event.google_event_id && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800">
                <Globe size={10} /> Sincronizado
              </div>
            )}
          </div>

          {/* Time and Date */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-bold dark:text-white">
                {startDate.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Clock size={12} />{' '}
                {startDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                -{' '}
                {endDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ({durationText})
              </p>
            </div>
          </div>

          {/* Location / Link */}
          {(event.location || event.virtual_link) && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400">
                {event.virtual_link ? (
                  <Video size={20} />
                ) : (
                  <MapPin size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {event.virtual_link ? (
                  <a
                    href={event.virtual_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1.5 truncate"
                  >
                    Entrar na Reunião <ExternalLink size={14} />
                  </a>
                ) : (
                  <p className="text-sm font-bold dark:text-white truncate">
                    {event.location}
                  </p>
                )}
                <p className="text-xs font-medium text-slate-500">
                  {event.virtual_link ? 'Link Virtual' : 'Endereço Presencial'}
                </p>
              </div>
            </div>
          )}

          {/* Vinculação */}
          {event.case_id && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">
                  Processo {event.case_id}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Cliente ID {event.client_id || 'N/A'}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Descrição
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                "{event.description}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex flex-col gap-3">
          {event.status === 'agendado' ? (
            <>
              <button
                onClick={handleToggleComplete}
                disabled={isUpdatingStatus}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isUpdatingStatus ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                Marcar como Concluído
              </button>
              <button
                onClick={handleCancel}
                disabled={isUpdatingStatus}
                className="w-full py-4 bg-white dark:bg-navy-800/50 border border-red-200 dark:border-red-900 text-red-600 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <AlertCircle size={20} />
                Cancelar Evento
              </button>
            </>
          ) : event.status === 'concluído' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl border border-green-100 dark:border-green-800 font-bold uppercase tracking-widest text-xs">
                <CheckCircle2 size={18} /> Evento Concluído com Sucesso
              </div>
              <button
                onClick={handleToggleComplete}
                className="text-xs font-bold text-slate-400 hover:text-primary-600 uppercase tracking-widest transition-colors"
              >
                Reverter para Pendente
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-800 font-bold uppercase tracking-widest text-xs">
              <AlertCircle size={18} /> Evento Cancelado
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
