
export const googleAuthService = {
  connect: async (): Promise<{ success: boolean; email: string }> => {
    // Simular redirect OAuth e callback
    await new Promise((r) => setTimeout(r, 2000));

    // Simular sucesso
    const fakeToken = {
      access_token: 'fake_access_token_' + crypto.randomUUID(),
      refresh_token: 'fake_refresh_token_' + crypto.randomUUID(),
      email: 'advogado@gmail.com',
      connected_at: new Date().toISOString(),
    };

    // Salvar no localStorage
    localStorage.setItem('google_calendar_token', JSON.stringify(fakeToken));

    return { success: true, email: fakeToken.email };
  },

  disconnect: async (): Promise<void> => {
    await new Promise((r) => setTimeout(r, 500));
    localStorage.removeItem('google_calendar_token');
  },

  isConnected: (): boolean => {
    return localStorage.getItem('google_calendar_token') !== null;
  },

  getConnectedEmail: (): string | null => {
    const token = localStorage.getItem('google_calendar_token');
    if (!token) return null;
    const parsed = JSON.parse(token);
    return parsed.email;
  },

  getLastSync: (): string | null => {
    const token = localStorage.getItem('google_calendar_token');
    if (!token) return null;
    const parsed = JSON.parse(token);
    return parsed.connected_at;
  },
};
