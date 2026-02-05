import React, { useMemo } from "react";
import { AlertTriangle, Info, CheckCircle2, ChevronRight } from "lucide-react";
import { ForecastMonth } from "../../types";

interface ForecastAlertsProps {
  forecastData: ForecastMonth[];
}

export const ForecastAlerts: React.FC<ForecastAlertsProps> = ({
  forecastData,
}) => {
  const alerts = useMemo(() => {
    if (forecastData.length === 0) return [];
    const alertList = [];

    // Verificar saldo negativo
    const negativeMonths = forecastData.filter((f) => f.projected_balance < 0);
    if (negativeMonths.length > 0) {
      alertList.push({
        type: "danger",
        title: "ATENÇÃO: Saldo Negativo Projetado",
        message: `${negativeMonths.length} mês(es) com previsão de déficit: ${negativeMonths.map((m) => m.month).join(", ")}.`,
        suggestions: [
          "Reduza despesas operacionais não essenciais",
          "Intensifique prospecção de novos clientes",
          "Revise a precificação de honorários de êxito",
        ],
        icon: <AlertTriangle size={24} />,
      });
    }

    // Verificar queda de receita
    const firstMonth = forecastData[0];
    const lastMonth = forecastData[forecastData.length - 1];
    const revenueChange =
      ((lastMonth.projected_revenue - firstMonth.projected_revenue) /
        firstMonth.projected_revenue) *
      100;

    if (revenueChange < -20) {
      alertList.push({
        type: "warning",
        title: "Tendência de Queda no Faturamento",
        message: `Redução de ${Math.abs(revenueChange).toFixed(1)}% na receita projetada para o semestre.`,
        suggestions: [
          "Planeje ações de marketing jurídico imediatamente",
          "Avalie contratos de retainer prestes a vencer",
        ],
        icon: <Info size={24} />,
      });
    } else if (revenueChange > 20) {
      alertList.push({
        type: "success",
        title: "Excelente Tendência de Crescimento!",
        message: `Crescimento orgânico de ${revenueChange.toFixed(1)}% projetado nos próximos meses.`,
        suggestions: [
          "Ajuste a infraestrutura para suportar a demanda",
          "Considere reinvestir o excedente em tecnologia",
        ],
        icon: <CheckCircle2 size={24} />,
      });
    }

    return alertList;
  }, [forecastData]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`p-6 rounded-[2rem] border-2 flex gap-6 items-start shadow-sm ${
            alert.type === "danger"
              ? "bg-red-500/10 border-red-500/20 text-red-700"
              : alert.type === "warning"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-700"
                : "bg-green-500/10 border-green-500/20 text-green-700"
          }`}
        >
          <div className="shrink-0 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            {alert.icon}
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-base font-black uppercase tracking-tight">
              {alert.title}
            </h4>
            <p className="text-sm font-medium opacity-80">{alert.message}</p>
            <ul className="space-y-1">
              {alert.suggestions.map((s, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60"
                >
                  <ChevronRight size={12} /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
