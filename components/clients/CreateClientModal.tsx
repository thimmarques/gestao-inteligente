import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  UserPlus,
  Shield,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Check,
  Smartphone,
  Building2,
  FileText,
  CreditCard,
  Banknote,
  Info,
  MapPin,
  Users,
  Briefcase,
  Scale,
  DollarSign,
  Building,
  AlertCircle,
  Heart,
  Calendar as CalendarIcon,
  Percent,
  CheckSquare,
  Square,
  CreditCard as CardIcon,
  Wallet,
  HandCoins,
  ChevronDown,
} from "lucide-react";
import { ClientType, Client } from "../../types";
import { CPFCNPJInput } from "./CPFCNPJInput";
import { PhoneInput } from "./PhoneInput";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: Client | null;
  mode?: "create" | "edit";
}

type InternalTab = "pessoal" | "endereco" | "processo";

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode = "create",
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<InternalTab>("pessoal");
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingCEP, setIsSearchingCEP] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    type: ClientType.PARTICULAR,
    cpf_cnpj: "",
    email: "",
    phone: "",
    status: "ativo",
    nationality: "Brasileiro(a)",
    marital_status: "Solteiro(a)",
    profession: "",
    income: "",
    rg: "",
    rg_issuer: "SSP/SP",
    address: {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    },
    process: {
      number: "",
      legal_area: "cível",
      description: "",
    },
    financial_profile: {
      payment_method: "PIX",
      honorarios_firmados: "",
      tem_entrada: false,
      valor_entrada: "",
      num_parcelas_restante: "1",
      billing_day: 10,
      percentual_acordado: "",
      valor_honorarios: "",
      data_pagamento_final: "",
      comarca: "",
      appointment_date: "",
      tem_recurso: false,
      guia_principal: {
        protocolo: "",
        valor: "740",
        data: "2026-01",
        status: "Pago pelo Estado",
      },
      guia_recurso: {
        protocolo: "",
        valor: "360",
        data: "2026-01",
        status: "Pago pelo Estado",
      },
    },
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData || mode === "edit") {
        setFormData({ ...formData, ...initialData });
        setCurrentStep(2);
        setActiveTab("pessoal");
      } else {
        setCurrentStep(1);
        setActiveTab("pessoal");
      }
    }
  }, [initialData, isOpen, mode]);

  const legalAreaOptions = useMemo(() => {
    if (formData.type === ClientType.DEFENSORIA) {
      return [
        { value: "cível", label: "Cível", icon: Scale },
        { value: "criminal", label: "Criminal", icon: Shield },
      ];
    }
    return [
      { value: "cível", label: "Cível", icon: Scale },
      { value: "trabalhista", label: "Trabalhista", icon: Briefcase },
      { value: "criminal", label: "Criminal", icon: Shield },
      { value: "família", label: "Família", icon: Users },
      { value: "tributário", label: "Tributário", icon: DollarSign },
      { value: "previdenciário", label: "Previdenciário", icon: Heart },
      { value: "administrativo", label: "Administrativo", icon: Building },
    ];
  }, [formData.type]);

  const isStepValid = () => {
    // Todos os passos são válidos agora
    return true;
  };

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep === 2) {
      if (activeTab === "pessoal") setActiveTab("endereco");
      else if (activeTab === "endereco") setActiveTab("processo");
      else setCurrentStep(3);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      if (activeTab === "processo") setActiveTab("endereco");
      else if (activeTab === "endereco") setActiveTab("pessoal");
      else if (mode !== "edit") setCurrentStep(1);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCEPBlur = async () => {
    const cep = formData.address.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setIsSearchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev: any) => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setIsSearchingCEP(false);
    }
  };

  const steps = [
    { id: 1, label: "Tipo" },
    { id: 2, label: "Dados" },
    { id: 3, label: "Específicos" },
    { id: 4, label: "Finalizar" },
  ];

  const formatCNJ = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 20) v = v.substring(0, 20);
    return v.replace(
      /(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{4})/,
      "$1-$2.$3.$4.$5.$6",
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col animate-in zoom-in-95 duration-300 max-h-[95vh]">
        <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold dark:text-white">
              {mode === "edit"
                ? `Editar Cliente - ${formData.name}`
                : "Novo Cliente"}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
              Etapa {currentStep} de 4
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-10 py-6 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10" />
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-600 transition-all duration-500 -z-10"
              style={{
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              }}
            />
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    currentStep === s.id
                      ? "bg-primary-600 text-white scale-110 shadow-lg"
                      : currentStep > s.id
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  }`}
                >
                  {currentStep > s.id ? <Check size={14} /> : s.id}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${currentStep >= s.id ? "text-primary-600" : "text-slate-400"}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-lg font-bold dark:text-white mb-6">
                Selecione o tipo de contratação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  disabled={mode === "edit"}
                  onClick={() =>
                    setFormData({ ...formData, type: ClientType.PARTICULAR })
                  }
                  className={`p-8 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                    formData.type === ClientType.PARTICULAR
                      ? "border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 disabled:opacity-50"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${formData.type === ClientType.PARTICULAR ? "bg-primary-600 text-white shadow-xl shadow-primary-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                  >
                    <UserPlus size={40} />
                  </div>
                  <h4 className="text-lg font-bold dark:text-white">
                    Particular / Contratual
                  </h4>
                  <p className="text-sm text-slate-500 mt-2">
                    Cliente com contrato de honorários privado.
                  </p>
                </button>
                <button
                  disabled={mode === "edit"}
                  onClick={() =>
                    setFormData({ ...formData, type: ClientType.DEFENSORIA })
                  }
                  className={`p-8 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] ${
                    formData.type === ClientType.DEFENSORIA
                      ? "border-green-600 bg-green-50/50 dark:bg-green-900/20 shadow-lg"
                      : "border-slate-100 dark:border-slate-800 hover:border-slate-300 disabled:opacity-50"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${formData.type === ClientType.DEFENSORIA ? "bg-green-600 text-white shadow-xl shadow-green-500/30" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}
                  >
                    <Scale size={40} />
                  </div>
                  <h4 className="text-lg font-bold dark:text-white">
                    Defensoria Pública
                  </h4>
                  <p className="text-sm text-slate-500 mt-2">
                    Cliente assistido pela Defensoria Pública.
                  </p>
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
                {(["pessoal", "endereco", "processo"] as InternalTab[]).map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                        activeTab === tab
                          ? "border-primary-600 text-primary-600"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>

              {activeTab === "pessoal" && (
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 animate-in fade-in duration-200">
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Tipo de Contratação
                    </label>
                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2 cursor-not-allowed border border-slate-100 dark:border-slate-700">
                      {formData.type === ClientType.PARTICULAR ? (
                        <UserPlus size={16} className="text-primary-500" />
                      ) : (
                        <Scale size={16} className="text-green-500" />
                      )}
                      {formData.type === ClientType.PARTICULAR
                        ? "Particular / Contratual"
                        : "Defensoria Pública"}
                    </div>
                  </div>
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Nacionalidade
                    </label>
                    <select
                      value={formData.nationality}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nationality: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    >
                      <option>Brasileiro(a)</option>
                      <option>Estrangeiro(a)</option>
                      <option>Naturalizado(a)</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Estado Civil
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          marital_status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    >
                      <option>Solteiro(a)</option>
                      <option>Casado(a)</option>
                      <option>Divorciado(a)</option>
                      <option>Viúvo(a)</option>
                      <option>União Estável</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Profissão
                    </label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) =>
                        setFormData({ ...formData, profession: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Renda Mensal (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.income}
                      onChange={(e) =>
                        setFormData({ ...formData, income: e.target.value })
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                      placeholder="Valor da renda"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      CPF / CNPJ
                    </label>
                    <CPFCNPJInput
                      value={formData.cpf_cnpj}
                      onChange={(v) =>
                        setFormData({ ...formData, cpf_cnpj: v })
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      RG
                    </label>
                    <input
                      type="text"
                      value={formData.rg}
                      onChange={(e) =>
                        setFormData({ ...formData, rg: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Emissor
                    </label>
                    <input
                      type="text"
                      value={formData.rg_issuer}
                      onChange={(e) =>
                        setFormData({ ...formData, rg_issuer: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Telefone
                    </label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(v) => setFormData({ ...formData, phone: v })}
                    />
                  </div>
                </div>
              )}

              {activeTab === "endereco" && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-200">
                  <div className="md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      CEP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.address.cep}
                        onBlur={handleCEPBlur}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: {
                              ...formData.address,
                              cep: e.target.value
                                .replace(/\D/g, "")
                                .substring(0, 8),
                            },
                          })
                        }
                        placeholder="00000-000"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                      />
                      {isSearchingCEP && (
                        <Loader2
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 animate-spin"
                          size={16}
                        />
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Logradouro (Domicílio)
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            street: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            number: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.address.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            neighborhood: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: {
                            ...formData.address,
                            city: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {activeTab === "processo" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Número do Processo
                    </label>
                    <input
                      type="text"
                      value={formData.process.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          process: {
                            ...formData.process,
                            number: formatCNJ(e.target.value),
                          },
                        })
                      }
                      placeholder="0000000-00.0000.0.00.0000"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Área Jurídica
                    </label>
                    <select
                      value={formData.process.legal_area}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          process: {
                            ...formData.process,
                            legal_area: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                    >
                      {legalAreaOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-full space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Objeto / Descrição
                      </label>
                      <span className="text-[10px] font-bold text-slate-400">
                        {(formData.process.description || "").length}/1000
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={formData.process.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          process: {
                            ...formData.process,
                            description: e.target.value.substring(0, 1000),
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-10">
              {formData.type === ClientType.PARTICULAR ? (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold dark:text-white mb-6">
                    Configuração Financeira
                  </h3>

                  {formData.process.legal_area === "trabalhista" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div className="md:col-span-2 flex items-center gap-3 mb-2">
                        <Briefcase size={20} className="text-blue-500" />
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          Fluxo Trabalhista
                        </h4>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Percentual Acordado (%)
                        </label>
                        <div className="relative">
                          <Percent
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="number"
                            value={
                              formData.financial_profile.percentual_acordado
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  percentual_acordado: e.target.value,
                                },
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                            placeholder="Ex: 30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Valor Estimado (R$)
                        </label>
                        <div className="relative">
                          <DollarSign
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="number"
                            value={formData.financial_profile.valor_honorarios}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  valor_honorarios: e.target.value,
                                },
                              })
                            }
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Forma de Pagamento
                          </label>
                          <div className="relative">
                            <CreditCard
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={16}
                            />
                            <select
                              value={formData.financial_profile.payment_method}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    payment_method: e.target.value,
                                  },
                                })
                              }
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                            >
                              <option value="PIX">PIX</option>
                              <option value="Cartão de Crédito">
                                Cartão de Crédito
                              </option>
                              <option value="TED">TED / Transferência</option>
                              <option value="Dinheiro">Dinheiro</option>
                            </select>
                            <ChevronDown
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                              size={16}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                            Honorários Contratados (R$)
                          </label>
                          <div className="relative">
                            <Wallet
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={16}
                            />
                            <input
                              type="number"
                              value={
                                formData.financial_profile.honorarios_firmados
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    honorarios_firmados: e.target.value,
                                  },
                                })
                              }
                              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                              placeholder="0,00"
                            />
                          </div>
                        </div>

                        {formData.financial_profile.payment_method ===
                          "Cartão de Crédito" && (
                          <div className="space-y-1.5 md:col-span-2 animate-in slide-in-from-top-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Número de Parcelas do Restante
                            </label>
                            <div className="relative">
                              <CardIcon
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                              />
                              <select
                                value={
                                  formData.financial_profile
                                    .num_parcelas_restante
                                }
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    financial_profile: {
                                      ...formData.financial_profile,
                                      num_parcelas_restante: e.target.value,
                                    },
                                  })
                                }
                                className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border-none rounded-xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm appearance-none"
                              >
                                {Array.from(
                                  { length: 10 },
                                  (_, i) => i + 1,
                                ).map((n) => (
                                  <option key={n} value={n}>
                                    {n}x no cartão
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                size={16}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                              <HandCoins size={20} />
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">
                              Houve pagamento de entrada?
                            </h4>
                          </div>
                          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-inner border border-slate-100 dark:border-slate-700">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    tem_entrada: true,
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.financial_profile.tem_entrada ? "bg-primary-600 text-white shadow-md" : "text-slate-400"}`}
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    tem_entrada: false,
                                    valor_entrada: "",
                                  },
                                })
                              }
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!formData.financial_profile.tem_entrada ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white shadow-md" : "text-slate-400"}`}
                            >
                              Não
                            </button>
                          </div>
                        </div>

                        {formData.financial_profile.tem_entrada && (
                          <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                              Valor da Entrada (R$)
                            </label>
                            <div className="relative">
                              <DollarSign
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                              />
                              <input
                                type="number"
                                value={formData.financial_profile.valor_entrada}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    financial_profile: {
                                      ...formData.financial_profile,
                                      valor_entrada: e.target.value,
                                    },
                                  })
                                }
                                className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-base font-bold shadow-inner"
                                placeholder="0,00"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <FileText size={18} className="text-green-500" />
                      Dados Processuais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Comarca / Foro
                        </label>
                        <input
                          type="text"
                          value={formData.financial_profile.comarca}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              financial_profile: {
                                ...formData.financial_profile,
                                comarca: e.target.value,
                              },
                            })
                          }
                          placeholder="Ex: São Paulo"
                          className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                          Data de Nomeação
                        </label>
                        <input
                          type="date"
                          value={formData.financial_profile.appointment_date}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              financial_profile: {
                                ...formData.financial_profile,
                                appointment_date: e.target.value,
                              },
                            })
                          }
                          className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-10 relative">
                    <header className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Divisão de Guia (70/30)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            financial_profile: {
                              ...formData.financial_profile,
                              tem_recurso:
                                !formData.financial_profile.tem_recurso,
                            },
                          })
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.financial_profile.tem_recurso
                            ? "bg-slate-800 text-white shadow-lg"
                            : "bg-white dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {formData.financial_profile.tem_recurso ? (
                          <CheckSquare size={16} />
                        ) : (
                          <Square size={16} />
                        )}
                        Adicionar Recurso (30%)
                      </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Guia Principal (70%)
                        </h5>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Protocolo / Voucher"
                            value={
                              formData.financial_profile.guia_principal
                                .protocolo
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  guia_principal: {
                                    ...formData.financial_profile
                                      .guia_principal,
                                    protocolo: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                          />
                          <div className="flex gap-4">
                            <input
                              type="number"
                              value={
                                formData.financial_profile.guia_principal.valor
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    guia_principal: {
                                      ...formData.financial_profile
                                        .guia_principal,
                                      valor: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-1/2 px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-bold"
                            />
                            <input
                              type="month"
                              value={
                                formData.financial_profile.guia_principal.data
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    guia_principal: {
                                      ...formData.financial_profile
                                        .guia_principal,
                                      data: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-1/2 px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                            />
                          </div>
                          <select
                            value={
                              formData.financial_profile.guia_principal.status
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  guia_principal: {
                                    ...formData.financial_profile
                                      .guia_principal,
                                    status: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-bold"
                          >
                            <option>Pendente</option>
                            <option>Protocolado</option>
                            <option>Pago pelo Estado</option>
                          </select>
                        </div>
                      </div>

                      <div
                        className={`space-y-6 transition-all duration-500 ${formData.financial_profile.tem_recurso ? "opacity-100 translate-x-0" : "opacity-30 pointer-events-none grayscale"}`}
                      >
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Recurso (30%)
                        </h5>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Protocolo Recurso"
                            value={
                              formData.financial_profile.guia_recurso.protocolo
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  guia_recurso: {
                                    ...formData.financial_profile.guia_recurso,
                                    protocolo: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                          />
                          <div className="flex gap-4">
                            <input
                              type="number"
                              value={
                                formData.financial_profile.guia_recurso.valor
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    guia_recurso: {
                                      ...formData.financial_profile
                                        .guia_recurso,
                                      valor: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-1/2 px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-bold"
                            />
                            <input
                              type="month"
                              value={
                                formData.financial_profile.guia_recurso.data
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  financial_profile: {
                                    ...formData.financial_profile,
                                    guia_recurso: {
                                      ...formData.financial_profile
                                        .guia_recurso,
                                      data: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-1/2 px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm"
                            />
                          </div>
                          <select
                            value={
                              formData.financial_profile.guia_recurso.status
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                financial_profile: {
                                  ...formData.financial_profile,
                                  guia_recurso: {
                                    ...formData.financial_profile.guia_recurso,
                                    status: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 dark:text-white text-sm font-bold"
                          >
                            <option>Pendente</option>
                            <option>Protocolado</option>
                            <option>Pago pelo Estado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Revisar Dados Principais
                </h4>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Nome
                    </p>
                    <p className="text-sm font-bold dark:text-white">
                      {formData.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Documento
                    </p>
                    <p className="text-sm font-mono dark:text-white">
                      {formData.cpf_cnpj || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Notas Gerais / Observações Adicionais
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value.substring(0, 1000),
                    })
                  }
                  rows={6}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-2 focus:ring-primary-500 dark:text-white text-sm resize-none shadow-inner"
                  placeholder="Informações adicionais relevantes..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-8 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            disabled={
              currentStep === 1 ||
              (mode === "edit" && currentStep === 2 && activeTab === "pessoal")
            }
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 disabled:opacity-0 transition-all"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Cancelar
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-10 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95"
              >
                Próxima Etapa
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/20 active:scale-95"
              >
                {isSaving ? <Loader2 size={18} /> : <Save size={18} />}
                {mode === "edit" ? "Atualizar Cliente" : "Salvar Cliente"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
