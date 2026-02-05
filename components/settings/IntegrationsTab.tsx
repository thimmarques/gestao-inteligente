import React, { useState, useEffect } from "react";
import {
  Globe,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import { googleAuthService } from "../../services/googleAuthService.ts";

export const IntegrationsTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    setIsConnected(googleAuthService.isConnected());
    setConnectedEmail(googleAuthService.getConnectedEmail());
    setLastSync(googleAuthService.getLastSync());
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await googleAuthService.connect();
      if (result.success) {
        setIsConnected(true);
        setConnectedEmail(result.email);
        setLastSync(new Date().toISOString());
      }
    } catch (error) {
      alert("Erro ao conectar com Google. Tente novamente.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm("Deseja realmente desconectar sua conta do Google Calendar?")) {
      await googleAuthService.disconnect();
      setIsConnected(false);
      setConnectedEmail(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10">
          <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-inner flex items-center justify-center shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
              className="w-12 h-12"
              alt="Google Calendar"
            />
          </div>

          <div className="flex-1 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold dark:text-white">
                  Google Calendar
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Sincronize audiências, reuniões e prazos fatais com sua agenda
                  pessoal.
                </p>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest self-start md:self-center flex items-center gap-2 border ${
                  isConnected
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
                />
                {isConnected ? "Conectado" : "Desconectado"}
              </span>
            </div>

            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />

            {isConnected ? (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] grid grid-cols-1 sm:grid-cols-2 gap-6 border border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Conta Conectada
                    </p>
                    <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      {connectedEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Última Sincronização
                    </p>
                    <p className="text-sm font-bold dark:text-white flex items-center gap-2">
                      <RefreshCw size={16} className="text-primary-500" />
                      {lastSync
                        ? new Date(lastSync).toLocaleString("pt-BR")
                        : "Nunca"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                    <RefreshCw size={16} />
                    Sincronizar Agora
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl text-xs font-bold transition-all"
                  >
                    <LogOut size={16} />
                    Desconectar Agenda
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 flex gap-4">
                  <AlertCircle
                    className="text-primary-600 shrink-0"
                    size={24}
                  />
                  <p className="text-sm text-primary-900 dark:text-primary-300 font-medium leading-relaxed">
                    Ao conectar, o LegalTech criará automaticamente eventos para
                    todas as suas audiências agendadas e enviará lembretes
                    baseados em sua agenda pessoal.
                  </p>
                </div>
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 transition-all active:scale-95"
                >
                  {isConnecting ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Globe size={24} />
                  )}
                  {isConnecting ? "Conectando..." : "Conectar Google Calendar"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
