
export const seedClients = () => {
  const existing = localStorage.getItem('legaltech_clients');
  if (existing) return;
  localStorage.setItem('legaltech_clients', JSON.stringify([]));
};
