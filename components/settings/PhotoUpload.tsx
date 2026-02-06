import React, { useState, useRef, useEffect } from 'react';
import { Camera, Trash2, X, Upload, Check, Loader2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { updateLawyer } from '../../utils/settingsPersistence';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string) => void;
  onPhotoRemove: () => void;
  name: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  onPhotoRemove,
  name,
}) => {
  const { refreshAll } = useApp();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentPhotoUrl || null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza o preview caso a prop currentPhotoUrl mude (ex: carregamento inicial)
  useEffect(() => {
    setPreviewUrl(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são aceitas');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!previewUrl) return;
    setIsUploading(true);

    // Simular delay de processamento/compressão
    setTimeout(() => {
      try {
        try {
          updateLawyer({ photo_url: previewUrl });
        } catch (error) {
          console.error(
            'Erro ao salvar localmente (possivelmente limite de storage):',
            error
          );
          // Não impede o fluxo, pois o objetivo principal é passar a URL para o pai
        }

        onPhotoChange(previewUrl);
        refreshAll(); // CRÍTICO: Atualiza o contexto global
        setIsEditing(false);
      } catch (error) {
        console.error('Erro ao processar foto:', error);
        alert('Erro ao processar a imagem. Tente uma imagem menor.');
      } finally {
        setIsUploading(false);
      }
    }, 800);
  };

  const handleRemove = () => {
    if (confirm('Deseja remover sua foto de perfil?')) {
      setPreviewUrl(null);
      updateLawyer({ photo_url: '' });
      onPhotoRemove();
      refreshAll(); // CRÍTICO: Atualiza o contexto global
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover animate-in fade-in duration-500"
            />
          ) : (
            <span className="text-4xl font-bold text-slate-400">
              {initials || '??'}
            </span>
          )}
        </div>
        <div
          className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"
          title="Online"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Camera size={14} />
          Alterar Foto
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold dark:text-white">
                Ajustar Foto
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-slate-50 dark:bg-slate-800 border-4 border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Large Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload size={48} className="text-slate-300" />
                )}
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 transition-all group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Upload
                  size={24}
                  className="text-slate-400 group-hover:text-primary-500"
                />
                <p className="text-sm font-bold dark:text-slate-300 text-center">
                  Clique para selecionar
                </p>
                <p className="text-xs text-slate-400">
                  JPG, PNG ou WebP • Máx 5MB
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isUploading || !previewUrl}
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                {isUploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
