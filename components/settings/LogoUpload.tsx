import React, { useRef } from "react";
import { Building2, Upload, X, Check } from "lucide-react";

interface LogoUploadProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string) => void;
  onLogoRemove: () => void;
}

export const LogoUpload: React.FC<LogoUploadProps> = ({
  currentLogoUrl,
  onLogoChange,
  onLogoRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo muito grande. Máximo: 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onLogoChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-[300px] h-[150px] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/10 transition-all group overflow-hidden"
      >
        <input
          type="file"
          ref={inputRef}
          onChange={handleFile}
          className="hidden"
          accept="image/png,image/jpeg,image/svg+xml"
        />

        {currentLogoUrl ? (
          <img
            src={currentLogoUrl}
            alt="Office Logo"
            className="max-h-[100px] max-w-[260px] object-contain animate-in zoom-in duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary-500 transition-colors">
            <Upload size={32} />
            <p className="text-xs font-bold uppercase tracking-widest">
              Selecionar Logo
            </p>
            <p className="text-[10px] opacity-60">PNG, JPG ou SVG • Máx 2MB</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
        >
          {currentLogoUrl ? "Alterar Logo" : "Adicionar Logo"}
        </button>
        {currentLogoUrl && (
          <button
            onClick={onLogoRemove}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

import { Trash2 } from "lucide-react";
