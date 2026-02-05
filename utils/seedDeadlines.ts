export const seedDeadlines = () => {
  const existing = localStorage.getItem("legaltech_deadlines");
  if (existing) return;
  localStorage.setItem("legaltech_deadlines", JSON.stringify([]));
};
