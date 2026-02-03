
import { Deadline } from '../types';

export interface DeadlineLogEntry {
  id: string;
  deadline_id: string;
  title: string;
  process_number?: string;
  completed_at: string;
  user_name: string;
  action: 'finalizado' | 'revertido';
}

const STORAGE_KEY = 'legaltech_deadlines_security_log';

export const deadlineLogger = {
  logCompletion: (deadline: Deadline, userName: string) => {
    const rawLogs = localStorage.getItem(STORAGE_KEY);
    const logs: DeadlineLogEntry[] = rawLogs ? JSON.parse(rawLogs) : [];
    
    const newEntry: DeadlineLogEntry = {
      id: crypto.randomUUID(),
      deadline_id: deadline.id,
      title: deadline.title,
      process_number: deadline.case?.process_number,
      completed_at: new Date().toISOString(),
      user_name: userName,
      action: 'finalizado'
    };
    
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 500))); // Mantém os últimos 500 logs
  },
  
  logReversion: (deadline: Deadline, userName: string) => {
    const rawLogs = localStorage.getItem(STORAGE_KEY);
    const logs: DeadlineLogEntry[] = rawLogs ? JSON.parse(rawLogs) : [];
    
    const newEntry: DeadlineLogEntry = {
      id: crypto.randomUUID(),
      deadline_id: deadline.id,
      title: deadline.title,
      process_number: deadline.case?.process_number,
      completed_at: new Date().toISOString(),
      user_name: userName,
      action: 'revertido'
    };
    
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 500)));
  },

  getLogs: (): DeadlineLogEntry[] => {
    const rawLogs = localStorage.getItem(STORAGE_KEY);
    return rawLogs ? JSON.parse(rawLogs) : [];
  }
};
