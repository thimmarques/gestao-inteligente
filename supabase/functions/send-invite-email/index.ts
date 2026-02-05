import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) {
            throw new Error('User not authenticated');
        }

        const { email, role } = await req.json();

        if (!email || !role) {
            throw new Error('Email and Role are required');
        }

        // 1. Get Creator's Profile (Office & Role)
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('office_id, role, name')
            .eq('id', user.id)
            .single();

        if (profileError || !profile?.office_id) {
            throw new Error('Profile not found or no office assigned');
        }

        // 2. Permission Check
        // Admin can invite anyone. Lawyer can ONLY invite assistant/intern.
        if (profile.role !== 'admin') {
            if (profile.role === 'lawyer') {
                if (!['assistant', 'intern'].includes(role)) {
                    throw new Error('Lawyers can only invite Assistants or Interns');
                }
            } else {
                throw new Error('Permission denied: You cannot send invites.');
            }
        }

        // 3. Upsert Invite (Prevent duplicates for pending)
        // We use Service Role to bypass RLS for checking/inserting safely if needed, 
        // but better to use the user's context if Policies allow. 
        // However, for consistency and "system action" of sending email, we'll use Admin Client for the DB write 
        // to ensure we strictly control the data, though User Client is fine if RLS is correct.
        // Let's stick to User Client first to respect RLS policies we created.

        // Check if invite exists
        const { data: existingInvite } = await supabaseClient
            .from('invites')
            .select('id, status')
            .eq('office_id', profile.office_id)
            .eq('email', email)
            .in('status', ['pending', 'sent'])
            .maybeSingle();

        if (existingInvite) {
            return new Response(
                JSON.stringify({ message: 'Invite already pending for this user.', invite: existingInvite }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
        }

        // Insert new invite
        const { data: newInvite, error: insertError } = await supabaseClient
            .from('invites')
            .insert({
                office_id: profile.office_id,
                email,
                role,
                status: 'sent',
                created_by: user.id
            })
            .select()
            .single();

        if (insertError) throw insertError;

        // 4. Mock Email Sending
        console.log(`[MOCK EMAIL] To: ${email} | Subject: Convite para ${profile.office_id} | From: ${profile.name}`);
        console.log(`[MOCK EMAIL] Body: Olá! Você foi convidado para participar do escritório no Gestão Inteligente.`);
        console.log(`[MOCK EMAIL] Action: Acesse ${req.headers.get('origin') || 'http://localhost:5173'}/login para entrar.`);

        return new Response(
            JSON.stringify({ message: 'Invite sent successfully', invite: newInvite }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
});
