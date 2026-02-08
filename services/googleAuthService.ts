import { supabase } from '../lib/supabase';

export const googleAuthService = {
  connect: async (): Promise<{ success: boolean; url?: string }> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Frontend Session:', session ? 'Exists' : 'Missing');
      console.log(
        'Frontend Access Token:',
        session?.access_token ? 'Present' : 'Missing'
      );

      if (!session?.access_token) {
        console.error('No access token found in session');
        return { success: false };
      }

      const authUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-auth/url?userId=${session?.user?.id}`;

      console.log('Target URL (Simplified):', authUrl);

      const response = await fetch(authUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch (e) {
          errorDetails = await response.text();
        }
        console.error('Fetch Error:', errorDetails);
        throw new Error(
          `Edge Function Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Edge Function Response:', data);

      if (data?.url) {
        window.location.href = data.url;
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      console.error('Error initiating Google connection:', error);
      if (error instanceof Error) {
        console.error('Error Message:', error.message);
      }
      return { success: false };
    }
  },

  handleCallback: async (
    code: string
  ): Promise<{ success: boolean; email?: string }> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke(
        'google-auth/exchange',
        {
          method: 'POST',
          body: {
            code,
            userId: session?.user?.id,
          },
        }
      );

      if (error) throw error;

      if (data?.success) {
        return { success: true, email: data.email };
      }

      return { success: false };
    } catch (error) {
      console.error('Error handling callback:', error);
      return { success: false };
    }
  },

  disconnect: async (): Promise<void> => {
    try {
      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('provider', 'google_calendar');

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  },

  checkConnection: async (): Promise<{
    isConnected: boolean;
    email?: string;
    lastSync?: string;
  }> => {
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('provider', 'google_calendar')
        .single();

      if (error || !data) return { isConnected: false };

      return {
        isConnected: true,
        email: data.connected_email,
        lastSync: data.updated_at,
      };
    } catch (error) {
      return { isConnected: false };
    }
  },

  isConnected: (): boolean => {
    // This is now async, so we can't sync return.
    // Consumers must use checkConnection() or manage state based on it.
    // For compatibility, we might return false here and let the component fetch.
    return false;
  },

  getConnectedEmail: (): string | null => {
    return null; // Deprecated, use checkConnection
  },

  getLastSync: (): string | null => {
    return null; // Deprecated, use checkConnection
  },
};
