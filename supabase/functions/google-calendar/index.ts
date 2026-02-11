import { serve } from 'std/server';
import { createClient } from 'supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken(
  supabase: ReturnType<typeof createClient>,
  userId: string
) {
  const { data: integration, error } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google_calendar')
    .single();

  if (error || !integration) {
    console.error('No integration found:', error?.message);
    throw new Error(
      'No Google Calendar integration found. Please connect your Google account first.'
    );
  }

  // Check if token is still valid
  if (new Date(integration.expires_at) > new Date()) {
    return integration.access_token;
  }

  // Refresh token
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

  console.log('Refreshing Google access token for user:', userId);

  const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: integration.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  const tokens = await refreshRes.json();

  if (tokens.error) {
    console.error(
      'Token refresh failed:',
      tokens.error,
      tokens.error_description
    );
    throw new Error(
      `Failed to refresh token: ${tokens.error_description || tokens.error}`
    );
  }

  // Update DB with new token
  await supabase
    .from('user_integrations')
    .update({
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', 'google_calendar');

  return tokens.access_token;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // All requests are POST with action in body
    const body = await req.json();
    const { action, userId } = body;

    console.log('google-calendar called — action:', action, 'userId:', userId);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!action) {
      return new Response(
        JSON.stringify({
          error: 'Missing action parameter. Use: list, create, delete',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const accessToken = await getAccessToken(supabaseAdmin, userId);

    // ─── LIST EVENTS ───
    if (action === 'list') {
      const timeMin = body.timeMin || new Date().toISOString();
      const timeMax = body.timeMax;

      let queryUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=100`;
      if (timeMax) queryUrl += `&timeMax=${encodeURIComponent(timeMax)}`;

      console.log('Listing events from Google Calendar...');

      const res = await fetch(queryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json();

      if (data.error) {
        console.error('Google Calendar API error:', JSON.stringify(data.error));
        throw new Error(`Google API: ${data.error.message}`);
      }

      console.log(`Found ${data.items?.length || 0} events`);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ─── CREATE EVENT ───
    if (action === 'create') {
      // Transform system format to Google Calendar API format
      const googleEvent: Record<string, unknown> = {
        summary: body.title || 'Sem título',
        description: body.description || '',
        start: {
          dateTime: body.start_time,
          timeZone: 'America/Sao_Paulo',
        },
        end: {
          dateTime: body.end_time,
          timeZone: 'America/Sao_Paulo',
        },
      };

      if (body.location) {
        googleEvent.location = body.location;
      }

      console.log(
        'Creating Google Calendar event:',
        JSON.stringify(googleEvent)
      );

      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );

      const data = await res.json();

      if (data.error) {
        console.error(
          'Google Calendar create error:',
          JSON.stringify(data.error)
        );
        throw new Error(`Google API: ${data.error.message}`);
      }

      console.log('Event created with ID:', data.id);

      return new Response(
        JSON.stringify({ id: data.id, htmlLink: data.htmlLink }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ─── DELETE EVENT ───
    if (action === 'delete') {
      const eventId = body.eventId;

      if (!eventId) {
        return new Response(
          JSON.stringify({ error: 'Missing eventId for delete action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Deleting Google Calendar event:', eventId);

      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!res.ok && res.status !== 410) {
        const errorData = await res.json();
        console.error(
          'Google Calendar delete error:',
          JSON.stringify(errorData)
        );
        throw new Error(
          `Google API: ${errorData.error?.message || 'Delete failed'}`
        );
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        error: `Unknown action: ${action}. Use: list, create, delete`,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('google-calendar error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
