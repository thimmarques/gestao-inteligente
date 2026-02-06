import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

interface DocumentsTabProps {
  caseId: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ caseId }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFiles = (files: FileList) => {
    setIsUploading(true);
    // Simular upload
    setTimeout(() => {
      const newDocs = Array.from(files).map((f) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: f.name.split('.').pop()?.toLowerCase(),
        uploaded_at: new Date().toISOString(),
      }));
      setDocuments((prev) => [...prev, ...newDocs]);
      setIsUploading(false);
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Área de Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
        className={`relative p-12 border-2 border-dashed rounded-[2.5rem] text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-primary-400'
        }`}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.png"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-sm font-bold text-primary-600">
              Enviando arquivos...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Upload size={32} />
            </div>
            <div>
              <h4 className="text-lg font-bold dark:text-white">
                Arraste arquivos ou clique para selecionar
              </h4>
              <p className="text-sm text-slate-500 mt-1">
                Formatos aceitos: PDF, DOCX, JPG, PNG • Máximo 10MB por arquivo
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Documentos */}
      <div className="space-y-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          Documentos Anexados
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold text-slate-500">
            {documents.length}
          </span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </h4>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group relative bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      doc.type === 'pdf'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {['jpg', 'png'].includes(doc.type) ? (
                      <ImageIcon size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  <div className="w-full">
                    <p
                      className="text-sm font-bold dark:text-white truncate px-2"
                      title={doc.name}
                    >
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {doc.size}
                    </p>
                  </div>
                </div>

                {/* Overlay de Ações */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-3xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-700 dark:text-slate-200 hover:scale-110 transition-transform shadow-xl">
                    <Download size={20} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDoc(doc.id);
                    }}
                    className="p-3 bg-red-500 rounded-2xl text-white hover:scale-110 transition-transform shadow-xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 italic">
              Nenhum documento anexado ao processo ainda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
