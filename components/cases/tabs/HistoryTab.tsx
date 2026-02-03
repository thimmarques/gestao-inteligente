
import React, { useState, useEffect } from 'react';
import { History, Download } from 'lucide-react';

interface HistoryTabProps {
  caseId: string;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ caseId }) => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const allActivities = JSON.parse(localStorage.getItem('legaltech_activities') || '[]');
    setActivities(allActivities.filter((a: any) => a.entity_id === caseId));
  }, [caseId]);

  const sortedActivities = activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold dark:text-white">Histórico Completo</h3>
      </div>

      <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((activity) => (
            <div key={activity.id} className="relative group">
              <div className={`absolute -left-[35px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 z-10 flex items-center justify-center ${
                activity.type === 'create' ? 'bg-green-500' : 
                activity.type === 'delete' ? 'bg-red-500' : 'bg-blue-500'
              }`}>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold dark:text-white">
                    {new Date(activity.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 italic">Nenhuma atividade registrada para este processo.</p>
          </div>
        )}
      </div>
    </div>
  );
};
