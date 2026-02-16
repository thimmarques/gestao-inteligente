import React, { useState, useCallback } from 'react';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Printer,
  FileSignature,
  Scale,
  Shield,
  Loader2,
  HardDrive,
  FolderPlus,
  Eye,
} from 'lucide-react';
import { useCase } from '../../../hooks/useQueries';
import { useApp } from '../../../contexts/AppContext';
import {
  generateProcuracaoPDF,
  generateDeclaracaoHipossuficienciaPDF,
} from '../../../utils/generateLegalDocuments';
import { googleDriveService } from '../../../services/googleDriveService';
import { toast } from 'sonner';

interface DocumentsTabProps {
  caseId: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({ caseId }) => {
  const { data: caseData } = useCase(caseId);
  const { office } = useApp();

  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);

  const handleGeneratePDF = async (
    type: 'procuracao' | 'hipossuficiencia' | 'contrato',
    action: 'download' | 'print'
  ) => {
    if (!caseData?.client || !office) {
      toast.error('Dados do cliente ou escritório incompletos.');
      return;
    }

    setIsGenerating(`${type}-${action}`);

    try {
      const params = {
        client: caseData.client,
        lawyer: caseData.lawyer || null,
        office: office,
      };

      let doc;
      if (type === 'procuracao') {
        doc = await generateProcuracaoPDF(params);
      } else if (type === 'hipossuficiencia') {
        doc = await generateDeclaracaoHipossuficienciaPDF(params);
      } else if (type === 'contrato') {
        // Use existing Procuracao generator as placeholder for generic structure
        // In a real scenario, this would be a dedicated generator
        doc = await generateProcuracaoPDF(params);
      }

      if (doc) {
        if (action === 'download') {
          const filename = `${type}_${caseData.client.name.replace(/\s+/g, '_')}.pdf`;
          doc.save(filename);
          toast.success('Documento gerado com sucesso!');
        } else {
          doc.autoPrint();
          const blob = doc.output('bloburl');
          window.open(blob);
          toast.success('Abriu janela de impressão.');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
      toast.error('Erro ao gerar documento.');
    } finally {
      setIsGenerating(null);
    }
  };

  const handleCreateDriveFolder = async () => {
    if (!caseData?.client) return;

    toast.promise(
      async () => {
        const folderName = `${caseData.process_number} - ${caseData.client?.name}`;
        const id = await googleDriveService.createFolder(folderName);
        if (id) {
          setDriveFolderId(id);
          return id;
        }
        throw new Error('Falha ao criar pasta');
      },
      {
        loading: 'Criando pasta no Google Drive...',
        success: 'Pasta criada com sucesso!',
        error: 'Erro ao criar pasta no Drive.',
      }
    );
  };

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
        type: f.name.split('.').pop()?.toLowerCase() || 'unknown',
        uploaded_at: new Date().toISOString(),
      }));
      setDocuments((prev) => [...prev, ...newDocs]);
      setIsUploading(false);
      toast.success('Documentos anexados com sucesso!');
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
    toast.success('Documento removido.');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Seção de Documentos Jurídicos (Gerador) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <FileSignature className="text-primary-600" size={24} />
            Documentação do Processo
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Procuração */}
          <div className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSignature size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Procuração
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Instrumento de mandato para representação processual.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGeneratePDF('procuracao', 'download')}
                disabled={!!isGenerating}
                className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating?.startsWith('procuracao-download') ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Download size={14} />
                )}
                Baixar
              </button>
              <button
                onClick={() => handleGeneratePDF('procuracao', 'print')}
                disabled={!!isGenerating}
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
                title="Imprimir"
              >
                {isGenerating?.startsWith('procuracao-print') ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Printer size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Card Hipossuficiência */}
          <div className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Scale size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Hipossuficiência
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Declaração de pobreza para fins de justiça gratuita.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  handleGeneratePDF('hipossuficiencia', 'download')
                }
                disabled={!!isGenerating}
                className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating?.startsWith('hipossuficiencia-download') ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Download size={14} />
                )}
                Baixar
              </button>
              <button
                onClick={() => handleGeneratePDF('hipossuficiencia', 'print')}
                disabled={!!isGenerating}
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
                title="Imprimir"
              >
                {isGenerating?.startsWith('hipossuficiencia-print') ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Printer size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Card Condicional: Contrato ou Placeholder */}
          {caseData?.type?.toLowerCase() === 'trabalhista' ? (
            <div className="bg-white dark:bg-navy-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                Contrato Honorários
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Contrato de prestação de serviços advocatícios trabalhistas.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleGeneratePDF('contrato', 'download')}
                  disabled={!!isGenerating}
                  className="flex-1 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating?.startsWith('contrato-download') ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Download size={14} />
                  )}
                  Baixar
                </button>
                <button
                  onClick={() => handleGeneratePDF('contrato', 'print')}
                  disabled={!!isGenerating}
                  className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center disabled:opacity-50"
                  title="Imprimir"
                >
                  {isGenerating?.startsWith('contrato-print') ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Printer size={16} />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-navy-900/50 p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center opacity-75">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h4 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">
                Novos Modelos
              </h4>
              <span className="text-xs font-bold uppercase tracking-widest text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
                Em breve
              </span>
            </div>
          )}
        </div>
      </section>

      <div className="w-full h-px bg-slate-100 dark:bg-white/10" />

      {/* ÁREA DE ANEXOS */}
      <section className="bg-white dark:bg-navy-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
              <HardDrive size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Anexos e Drive
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gerencie os arquivos do processo
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateDriveFolder}
            className="px-4 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <FolderPlus size={16} />
            Criar Pasta no Drive
          </button>
        </div>

        {/* Compact Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className={`relative h-32 border-2 border-dashed rounded-3xl transition-all cursor-pointer mb-8 group flex items-center justify-center gap-4 ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-slate-200 dark:border-white/10 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-white/5'
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
            <div className="flex items-center gap-3">
              <Loader2 className="animate-spin text-primary-500" />
              <span className="text-sm font-bold text-slate-600">
                Enviando...
              </span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                <Upload size={18} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Clique ou arraste arquivos
                </p>
                <p className="text-xs text-slate-400">
                  PDF, DOCX, Imagens (Max 10MB)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Lista Compacta de Documentos */}
        <div className="space-y-3">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-navy-900/50 rounded-2xl hover:bg-white dark:hover:bg-navy-800 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      doc.type === 'pdf'
                        ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                        : ['jpg', 'png'].includes(doc.type)
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                    }`}
                  >
                    {['jpg', 'png'].includes(doc.type) ? (
                      <ImageIcon size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {doc.name}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {doc.size} •{' '}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    title="Visualizar"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    title="Baixar"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                    title="Imprimir"
                  >
                    <Printer size={16} />
                  </button>
                  <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-1" />
                  <button
                    onClick={() => removeDoc(doc.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-slate-400 italic py-4">
              Nenhum anexo encontrado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
