import React from 'react';

interface GoogleSyncBadgeProps {
  googleEventId?: string | null;
}

export const GoogleSyncBadge: React.FC<GoogleSyncBadgeProps> = ({
  googleEventId,
}) => {
  if (!googleEventId) return null;

  return (
    <div
      className="absolute top-1 right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm z-10"
      title="Sincronizado com Google Calendar"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
        className="w-3.5 h-3.5"
        alt="Google"
      />
    </div>
  );
};
