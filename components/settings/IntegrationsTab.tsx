import React, { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { googleAuthService } from '../../services/googleAuthService.ts';
import { settingsConfig } from '../../utils/settingsConfig';

export const IntegrationsTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Check initial connection status
    checkStatus();

    // Check for callback code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleCallback(code);
      // Clean URL
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.hash
      );
    }
  }, []);

  const checkStatus = async () => {
    const status = await googleAuthService.checkConnection();
    setIsConnected(status.isConnected);
    if (status.email) setConnectedEmail(status.email);
    if (status.lastSync) setLastSync(status.lastSync);
  };

  const handleCallback = async (code: string) => {
    setIsConnecting(true);
    try {
      const result = await googleAuthService.handleCallback(code);
      if (result.success) {
        await checkStatus();
        alert('Conectado com sucesso!');
      } else {
        alert('Falha ao conectar.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro na conexão.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await googleAuthService.connect();
      if (!result.success) {
        alert('Erro ao iniciar conexão. Verifique os logs.');
      }
    } catch (error) {
      alert('Erro ao conectar com Google. Tente novamente.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Deseja realmente desconectar sua conta do Google Calendar?')) {
      await googleAuthService.disconnect();
      setIsConnected(false);
      setConnectedEmail(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={settingsConfig.cardClass + ' overflow-hidden'}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
              className="w-8 h-8"
              alt="Google Calendar"
            />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className={settingsConfig.sectionTitleClass}>
                  Google Calendar
                </h3>
                <p className={settingsConfig.sectionDescClass}>
                  Sincronize audiências, reuniões e prazos fatais com sua agenda
                  pessoal.
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest self-start md:self-center flex items-center gap-2 border ${
                  isConnected
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}
                />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

            {isConnected ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className={settingsConfig.labelClass}>Conta Conectada</p>
                    <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      {connectedEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className={settingsConfig.labelClass}>
                      Última Sincronização
                    </p>
                    <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                      <RefreshCw size={14} className="text-primary-500" />
                      {lastSync
                        ? new Date(lastSync).toLocaleString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                    <RefreshCw size={14} />
                    Sincronizar Agora
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-bold transition-all"
                  >
                    <LogOut size={14} />
                    Desconectar Agenda
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                  <AlertCircle
                    className="text-primary-600 shrink-0"
                    size={20}
                  />
                  <p className="text-xs text-primary-900 dark:text-primary-300 font-medium leading-relaxed">
                    Ao conectar, o LegalTech criará automaticamente eventos para
                    todas as suas audiências agendadas e enviará lembretes
                    baseados em sua agenda pessoal.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className={settingsConfig.buttonPrimaryClass}
                >
                  {isConnecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Globe size={16} />
                  )}
                  {isConnecting ? 'Conectando...' : 'Conectar Google Calendar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
