
export const seedCases = () => {
  const existing = localStorage.getItem('legaltech_cases');
  if (existing) return;
  localStorage.setItem('legaltech_cases', JSON.stringify([]));
};
