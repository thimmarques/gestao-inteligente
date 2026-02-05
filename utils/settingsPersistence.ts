import { Lawyer, Office, UserPreferences } from "../types.ts";

export const STORAGE_KEYS = {
  LAWYER: "current_lawyer",
  OFFICE: "legaltech_office",
  PREFERENCES: "legaltech_preferences",
  THEME: "theme",
  SESSION: "legaltech_fake_session",
  TEAM: "legaltech_team",
};

export function getCurrentLawyer(): Lawyer | null {
  const data = localStorage.getItem(STORAGE_KEYS.LAWYER);
  return data ? JSON.parse(data) : null;
}

export function updateLawyer(updates: Partial<Lawyer>): void {
  const current = getCurrentLawyer();
  if (!current) return;

  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.LAWYER, JSON.stringify(updated));

  // Sincronizar com a fake session usada no AuthContext
  const session = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (session) {
    const parsed = JSON.parse(session);
    localStorage.setItem(
      STORAGE_KEYS.SESSION,
      JSON.stringify({ ...parsed, ...updates }),
    );
  }

  // TAMBÉM atualizar na lista global da equipe (legaltech_team)
  const teamRaw = localStorage.getItem(STORAGE_KEYS.TEAM);
  if (teamRaw) {
    const team = JSON.parse(teamRaw);
    const index = team.findIndex(
      (m: any) => m.id === current.id || m.email === current.email,
    );
    if (index !== -1) {
      team[index] = {
        ...team[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
    }
  }
}

export function getOffice(): Office {
  const data = localStorage.getItem(STORAGE_KEYS.OFFICE);
  return data
    ? JSON.parse(data)
    : ({ id: "office-1", name: "LegalTech" } as Office);
}

export function updateOffice(updates: Partial<Office>): void {
  const current = getOffice();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.OFFICE, JSON.stringify(updated));
}

export function getPreferences(): UserPreferences {
  const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
  return data
    ? JSON.parse(data)
    : ({
        theme: "dark",
        fontSize: 14,
        timezone: "America/Sao_Paulo",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h",
        notifications: {
          nearDeadlines: true,
          urgentDeadlines: true,
          hearingsDayBefore: true,
          hearingsHourBefore: false,
          overduePayments: true,
          weeklySummary: false,
        },
      } as UserPreferences);
}

export function updatePreferences(updates: Partial<UserPreferences>): void {
  const current = getPreferences();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
}
