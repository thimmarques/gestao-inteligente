import {
  addMonths,
  format,
  subMonths,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinanceRecord, Client, ForecastMonth } from "../types";

export function calculateForecast(
  revenues: FinanceRecord[],
  expenses: FinanceRecord[],
  clients: Client[],
): ForecastMonth[] {
  const forecast: ForecastMonth[] = [];
  const now = new Date();

  // 1. Receitas Recorrentes (MRR de clientes ativos)
  const recurringRevenue = clients
    .filter((c) => c.type === "particular" && c.status === "ativo")
    .reduce((sum, c) => sum + (c.financial_profile?.retainer_fee || 0), 0);

  // 2. Receitas Variáveis (Média dos últimos 6 meses, ignorando retainers)
  const sixMonthsAgo = subMonths(now, 6);
  const last6MonthsRevenues = revenues.filter(
    (r) =>
      r.type === "receita" &&
      r.status === "pago" &&
      r.paid_date &&
      r.category !== "Retainer Fee (Mensalidade)" &&
      isWithinInterval(new Date(r.paid_date), {
        start: sixMonthsAgo,
        end: now,
      }),
  );
  const variableRevenueAvg =
    last6MonthsRevenues.reduce((sum, r) => sum + r.amount, 0) / 6;

  // 3. Despesas Fixas (Padrão: aluguel, software, marketing do último mês)
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const fixedExpenseCategories = [
    "Despesas Operacionais",
    "Software e Tecnologia",
    "Marketing",
  ];

  const lastMonthFixedExpenses = expenses
    .filter(
      (e) =>
        e.type === "despesa" &&
        fixedExpenseCategories.includes(e.category) &&
        e.status === "pago" &&
        e.paid_date &&
        isWithinInterval(new Date(e.paid_date), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    )
    .reduce((sum, e) => sum + e.amount, 0);

  // 4. Despesas Variáveis (Média histórica)
  const last6MonthsExpenses = expenses.filter(
    (e) =>
      e.type === "despesa" &&
      e.status === "pago" &&
      e.paid_date &&
      !fixedExpenseCategories.includes(e.category) &&
      isWithinInterval(new Date(e.paid_date), {
        start: sixMonthsAgo,
        end: now,
      }),
  );
  const variableExpenseAvg =
    last6MonthsExpenses.reduce((sum, e) => sum + e.amount, 0) / 6;

  // Gerar para os próximos 6 meses
  for (let i = 1; i <= 6; i++) {
    const targetMonth = addMonths(now, i);

    const projected_revenue = recurringRevenue + variableRevenueAvg;
    const projected_expenses =
      (lastMonthFixedExpenses || 2500) + variableExpenseAvg; // Fallback para fixo se vazio

    // Nível de confiança baseado no peso do recorrente
    const recurringWeight = recurringRevenue / projected_revenue;
    let confidence: "baixa" | "média" | "alta" = "baixa";
    if (recurringWeight >= 0.7) confidence = "alta";
    else if (recurringWeight >= 0.4) confidence = "média";

    forecast.push({
      month: format(targetMonth, "MMMM/yyyy", { locale: ptBR }),
      monthDate: targetMonth,
      recurring_revenue: recurringRevenue,
      variable_revenue: variableRevenueAvg,
      projected_revenue,
      fixed_expenses: lastMonthFixedExpenses || 2500,
      variable_expenses: variableExpenseAvg,
      projected_expenses,
      projected_balance: projected_revenue - projected_expenses,
      confidence,
    });
  }

  return forecast;
}
