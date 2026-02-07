import React from 'react';
import {
  ShieldCheck,
  Zap,
  Globe,
  Github,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Code2,
  Heart,
  Scale,
} from 'lucide-react';
import { settingsConfig } from '../../utils/settingsConfig';

export const AboutTab: React.FC = () => {
  const features = [
    'Gestão completa de Clientes e Processos',
    'Agenda Jurídica sincronizada com Google',
    'Prazos Processuais com IA de alertas',
    'Controle Financeiro e Fluxo de Caixa',
    'Inteligência Preditiva de Receitas',
    'Relatórios estratégicos em PDF/Excel',
    'Segurança e Criptografia de Ponta',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl pb-10 mx-auto">
      <section
        className={
          settingsConfig.cardClass + ' text-center relative p-8 overflow-hidden'
        }
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-600 to-indigo-600" />

        <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-4xl mx-auto shadow-xl shadow-primary-500/20 mb-6 animate-in zoom-in duration-700">
          L
        </div>

        <h2 className="text-3xl font-black dark:text-white tracking-tight">
          LegalTech Pro
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
          Inteligência para o Direito Moderno
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-slate-700">
            Versão 2.4.0 (Stable)
          </span>
          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
            Ambiente de Produção
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className={settingsConfig.cardClass + ' space-y-6'}>
          <h3
            className={
              settingsConfig.sectionTitleClass + ' flex items-center gap-2'
            }
          >
            <Zap size={18} className="text-primary-500" /> Recursos Ativos
          </h3>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium"
              >
                <div className="w-5 h-5 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 shrink-0">
                  <ShieldCheck size={12} strokeWidth={3} />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section className={settingsConfig.cardClass + ' space-y-6'}>
          <h3
            className={
              settingsConfig.sectionTitleClass + ' flex items-center gap-2'
            }
          >
            <MessageSquare size={18} className="text-primary-500" /> Suporte
            Técnico
          </h3>
          <div className="space-y-3">
            <a
              href="mailto:suporte@legaltech.com.br"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all group"
            >
              <span className="text-sm font-bold dark:text-white">
                Email Corporativo
              </span>
              <ExternalLink
                size={14}
                className="text-slate-400 group-hover:text-primary-500"
              />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all group"
            >
              <span className="text-sm font-bold dark:text-white">
                Central de Ajuda
              </span>
              <HelpCircle
                size={14}
                className="text-slate-400 group-hover:text-primary-500"
              />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-all group"
            >
              <span className="text-sm font-bold dark:text-white">
                Documentação API
              </span>
              <Code2
                size={14}
                className="text-slate-400 group-hover:text-primary-500"
              />
            </a>
          </div>
        </section>
      </div>

      <footer className="text-center pt-6 border-t border-slate-100 dark:border-slate-800">
        <p className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          Desenvolvido com{' '}
          <Heart size={12} className="text-red-500 fill-red-500" /> para
          Advogados Brasileiros
        </p>
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2">
          © 2026 LegalTech Technologies. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};
