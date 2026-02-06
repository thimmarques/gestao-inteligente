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
    const authHeader = req.headers.get('Authorization') ?? '';
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
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

    console.log(`[AUTH] User resolved: ${user.id}`);

    const { email, role } = await req.json();

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
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('office_id, role, name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.office_id) {
      console.error('Profile Error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found or no office assigned' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      );
    }

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
    const inviteLink = `${req.headers.get('origin') || 'https://gestao-inteligente-cyan.vercel.app'}/accept-invite?token=${token}`;

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
  } catch (error: any) {
    console.error('Global Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Ocorreu um erro interno',
        code: error.code || 'INTERNAL_ERROR',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 400,
      }
    );
  }
});
