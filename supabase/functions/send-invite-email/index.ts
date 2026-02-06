import { createClient } from 'supabase';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[DEBUG] Request received:', req.method);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
      console.error('[DEBUG] Missing environment variables');
      throw new Error('Internal infrastructure error: missing secrets');
    }

    // 1. Auth Validation (User Request Fix)
    const authHeader = req.headers.get('Authorization') ?? '';

    // Create client with SUPABASE_ANON_KEY and pass the bearer token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Validate user using getUser()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      console.error('[DEBUG] Auth validation failed:', authError);
      return new Response(
        JSON.stringify({
          error: 'User not authenticated',
          details: authError?.message || 'Sessão inválida ou expirada',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

    console.log('[DEBUG] User authenticated:', user.id);

    let body;
    try {
      body = await req.json();
      console.log('[DEBUG] Request body:', body);
    } catch (e) {
      console.error('[DEBUG] Failed to parse request JSON:', e);
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { email, role } = body;

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Email and Role are required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // 1. Get Creator's Profile (Office & Role) using Admin client to bypass RLS
    console.log('[DEBUG] Fetching profile for user:', user.id);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('office_id, role, name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.office_id) {
      console.error(
        '[DEBUG] Profile fetch failed:',
        profileError || 'No office_id'
      );
      return new Response(
        JSON.stringify({
          error: 'Profile Error',
          details:
            profileError?.message || 'Profile not found or no office assigned',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

    console.log('[DEBUG] Profile found:', profile);

    // 2. Permission Check
    // Admin can invite anyone. Lawyer can ONLY invite assistant/intern.
    if (profile.role !== 'admin') {
      if (profile.role === 'lawyer') {
        if (!['assistant', 'intern'].includes(role)) {
          return new Response(
            JSON.stringify({
              error: 'Lawyers can only invite Assistants or Interns',
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403,
            }
          );
        }
      } else {
        return new Response(
          JSON.stringify({
            error: 'Permission denied: You cannot send invites.',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        );
      }
    }

    // 3. Upsert Invite (Prevent duplicates for pending)
    const { data: existingInvite } = await supabaseAdmin
      .from('invites')
      .select('id, status')
      .eq('office_id', profile.office_id)
      .eq('email', email)
      .in('status', ['pending'])
      .maybeSingle();

    if (existingInvite) {
      return new Response(
        JSON.stringify({
          error: 'Convite já pendente para este usuário.',
          code: 'DUPLICATE_INVITE',
          details: { invite_id: existingInvite.id },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Generate a secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Insert new invite using Admin client
    const { data: newInvite, error: insertError } = await supabaseAdmin
      .from('invites')
      .insert({
        office_id: profile.office_id,
        email,
        role,
        status: 'pending',
        token: token,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
        sender_id: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert Error:', insertError);
      return new Response(
        JSON.stringify({
          error: 'Falha ao registrar convite no banco de dados.',
          code: 'DB_INSERT_ERROR',
          details: insertError,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400, // Using 400 for better frontend visibility of the error
        }
      );
    }

    // 4. Mock Email Sending
    const inviteLink = `${
      req.headers.get('origin') || 'https://gestao-inteligente-cyan.vercel.app'
    }/accept-invite?token=${token}`;

    console.log(`[MOCK EMAIL] To: ${email}`);
    console.log(`[MOCK EMAIL] Subject: Convite para ${profile.office_id}`);
    console.log(`[MOCK EMAIL] From: ${profile.name}`);
    console.log(`[MOCK EMAIL] Link: ${inviteLink}`);

    return new Response(
      JSON.stringify({
        message: 'Invite sent successfully',
        invite: newInvite,
        link: inviteLink, // For testing/dev purposes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    const err = error as {
      message?: string;
      code?: string;
      status?: number;
      stack?: string;
    };
    console.error('[DEBUG] Global Error Catch-all:', {
      message: err.message,
      code: err.code,
      status: err.status,
      stack: err.stack,
    });
    return new Response(
      JSON.stringify({
        error: err.message || 'Ocorreu um erro interno inesperado',
        code: err.code || 'INTERNAL_ERROR',
        details: err.stack, // Help identify where it crashed
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.status || 500, // Revert to 500 for unexpected errors unless status provided
      }
    );
  }
});
