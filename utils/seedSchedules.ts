
export const seedSchedules = () => {
  const existing = localStorage.getItem('legaltech_schedules');
  if (existing) return;
  localStorage.setItem('legaltech_schedules', JSON.stringify([]));
};
