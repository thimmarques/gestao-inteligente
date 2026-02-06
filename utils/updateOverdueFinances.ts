import { startOfDay } from 'date-fns';

export function updateOverdueFinances() {
  const raw = localStorage.getItem('legaltech_finances');
  if (!raw) return;

  const finances = JSON.parse(raw);
  const today = startOfDay(new Date());
  let updated = false;

  const updatedFinances = finances.map((finance: any) => {
    if (finance.status === 'pendente') {
      const dueDate = startOfDay(new Date(finance.due_date));
      if (dueDate < today) {
        updated = true;
        return { ...finance, status: 'vencido' };
      }
    }
    return finance;
  });

  if (updated) {
    localStorage.setItem('legaltech_finances', JSON.stringify(updatedFinances));
  }
}
