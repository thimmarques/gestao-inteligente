import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { TeamMember } from "../../types/team";

interface TeamProductivityChartProps {
  members: TeamMember[];
}

export const TeamProductivityChart: React.FC<TeamProductivityChartProps> = ({
  members,
}) => {
  const [period, setPeriod] = useState("este-mes");

  const data = useMemo(() => {
    return members
      .filter((m) => m.role !== "assistente" && m.status === "ativo")
      .map((m) => ({
        name: m.name.split(" ")[0],
        processos: m.stats?.active_cases || 0,
        concluidos: m.stats?.completed_cases || 0,
        taxaSucesso: m.stats?.success_rate || 0,
      }))
      .sort((a, b) => b.processos - a.processos);
  }, [members]);

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-primary-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-sm font-black dark:text-white uppercase tracking-widest">
            Produtividade Comparativa
          </h3>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
          {["Este Mês", "Últimos 3 Meses", "Este Ano"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p.toLowerCase().replace(/ /g, "-"))}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                period === p.toLowerCase().replace(/ /g, "-")
                  ? "bg-white dark:bg-slate-700 text-primary-600 shadow-sm"
                  : "text-slate-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              opacity={0.1}
              stroke="#94a3b8"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "none",
                borderRadius: "1.5rem",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
              itemStyle={{ padding: "4px 0" }}
              cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              height={50}
              iconType="circle"
              formatter={(value) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                  {value}
                </span>
              )}
            />
            <Bar
              dataKey="processos"
              name="Processos Ativos"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationDuration={1500}
            />
            <Bar
              dataKey="concluidos"
              name="Concluídos"
              fill="#22c55e"
              radius={[6, 6, 0, 0]}
              barSize={32}
              animationDuration={2000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Em andamento
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Eficiência Final
          </span>
        </div>
      </div>
    </div>
  );
};
