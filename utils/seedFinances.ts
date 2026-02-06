export const seedFinances = () => {
  const existing = localStorage.getItem('legaltech_finances');
  if (existing) return;
  localStorage.setItem('legaltech_finances', JSON.stringify([]));
};
