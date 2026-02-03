
export const seedAuditLogs = () => {
  const existing = localStorage.getItem('legaltech_audit_logs');
  if (existing) return;
  localStorage.setItem('legaltech_audit_logs', JSON.stringify([]));
};
