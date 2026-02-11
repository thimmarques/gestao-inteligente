import { serve } from 'std/server';
import { createClient } from 'supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log('google-auth-callback invoked');
    console.log('Code present:', !!code);
    console.log('State present:', !!state);

    if (!code) throw new Error('No code provided');
    if (!state) throw new Error('No state provided');

    // Decode state
    let stateData: { userId: string; redirectTo: string };
    try {
      stateData = JSON.parse(atob(state));
    } catch (e) {
      console.error('Failed to parse state:', e);
      throw new Error('Invalid state parameter');
    }

    const { userId, redirectTo } = stateData;
    console.log('User ID from state:', userId);
    console.log('Redirect to:', redirectTo);

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

    console.log('Client ID present:', !!clientId);
    console.log('Redirect URI:', redirectUri);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      console.error(
        'Token exchange error:',
        tokens.error,
        tokens.error_description
      );
      throw new Error(
        `Google OAuth error: ${tokens.error_description || tokens.error}`
      );
    }

    console.log('Token exchange successful');
    console.log('Access token present:', !!tokens.access_token);
    console.log('Refresh token present:', !!tokens.refresh_token);
    console.log('Expires in:', tokens.expires_in);

    // Get user email
    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );
    const userData = await userRes.json();
    console.log('User email:', userData.email);

    // Store in DB using Service Role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const upsertData = {
      user_id: userId,
      provider: 'google_calendar',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      connected_email: userData.email || null,
      updated_at: new Date().toISOString(),
    };

    console.log('Upserting integration for user:', userId);

    const { data: upsertResult, error: dbError } = await supabaseAdmin
      .from('user_integrations')
      .upsert(upsertData)
      .select();

    if (dbError) {
      console.error('Database upsert error:', JSON.stringify(dbError));
      throw dbError;
    }

    console.log(
      'Integration saved successfully:',
      JSON.stringify(upsertResult)
    );

    // Redirect user back to app
    const finalUrl = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}connected=true`;
    console.log('Redirecting to:', finalUrl);
    return Response.redirect(finalUrl, 302);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('google-auth-callback error:', message);
    return new Response(
      `<html><body><h2>Erro na conexão</h2><p>${message}</p><p><a href="/">Voltar ao sistema</a></p></body></html>`,
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      }
    );
  }
});
