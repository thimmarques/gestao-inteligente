import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color?: "blue" | "green" | "orange" | "red";
}

const colorMap = {
  blue: "text-blue-600 bg-blue-600/10 dark:text-blue-400 dark:bg-blue-400/10",
  green:
    "text-green-600 bg-green-600/10 dark:text-green-400 dark:bg-green-400/10",
  orange:
    "text-orange-600 bg-orange-600/10 dark:text-orange-400 dark:bg-orange-400/10",
  red: "text-red-600 bg-red-600/10 dark:text-red-400 dark:bg-red-400/10",
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  color = "blue",
}) => {
  const colorClasses = colorMap[color];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${colorClasses}`}
        >
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold dark:text-white tracking-tight">
          {value}
        </div>

        {subtitle && (
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 text-sm font-bold ${trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {trend.isPositive ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            {trend.value}%
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
};
