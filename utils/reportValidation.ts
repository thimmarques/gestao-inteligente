import { differenceInDays, isAfter, isBefore, startOfDay } from 'date-fns';

export function validateReportPeriod(
  startDate: Date,
  endDate: Date
): {
  isValid: boolean;
  error?: string;
  warning?: string;
} {
  const today = startOfDay(new Date());

  // Fim deve ser >= início
  if (isBefore(endDate, startDate)) {
    return {
      isValid: false,
      error: 'A data final deve ser posterior à data inicial',
    };
  }

  // Período não pode ser totalmente no futuro (pelo menos o início deve ser <= hoje)
  if (isAfter(startDate, today)) {
    return {
      isValid: false,
      error: 'A data inicial não pode ser uma data futura',
    };
  }

  // Período máximo: 2 anos (730 dias)
  const daysDiff = differenceInDays(endDate, startDate);
  if (daysDiff > 730) {
    return {
      isValid: false,
      error: 'O período máximo permitido para relatórios é de 2 anos',
    };
  }

  // Warning se período muito curto (< 7 dias)
  let warning;
  if (daysDiff < 7 && daysDiff >= 0) {
    warning =
      'Período muito curto selecionado. O relatório pode conter poucos dados estatísticos.';
  }

  return { isValid: true, warning };
}
