import React from "react";
import { Check } from "lucide-react";

interface LogDiffViewProps {
  details: string;
}

export const LogDiffView: React.FC<LogDiffViewProps> = ({ details }) => {
  let parsed;
  try {
    parsed = JSON.parse(details);
  } catch (e) {
    return (
      <pre className="text-[10px] text-slate-500 font-mono p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
        {details}
      </pre>
    );
  }

  const { before, after } = parsed;

  if (!before || !after) {
    return (
      <pre className="text-[10px] text-green-400 font-mono p-4 bg-slate-900 rounded-xl overflow-x-auto">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }

  const keys = Object.keys({ ...before, ...after });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <h5 className="text-[9px] font-black uppercase text-red-500 tracking-widest px-2">
          Anterior
        </h5>
        <div className="space-y-1">
          {keys.map((key) => (
            <div
              key={key}
              className="flex justify-between items-center text-[10px] p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800"
            >
              <span className="font-bold text-slate-400">{key}:</span>
              <span
                className={`line-through opacity-60 ${before[key] !== after[key] ? "text-red-500" : "text-slate-500"}`}
              >
                {String(before[key] ?? "-")}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-[9px] font-black uppercase text-green-500 tracking-widest px-2">
          Atual
        </h5>
        <div className="space-y-1">
          {keys.map((key) => (
            <div
              key={key}
              className="flex justify-between items-center text-[10px] p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <span className="font-bold text-slate-400">{key}:</span>
              <span
                className={`font-black ${before[key] !== after[key] ? "text-green-600" : "text-slate-500 opacity-50"}`}
              >
                {String(after[key] ?? "-")}
                {before[key] !== after[key] && (
                  <Check size={8} className="inline ml-1" />
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
