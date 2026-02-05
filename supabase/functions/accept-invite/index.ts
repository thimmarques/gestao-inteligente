
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { token, password, full_name } = await req.json()

        if (!token || !password || !full_name) {
            throw new Error('Missing required fields: token, password, full_name')
        }

        // 1. Verify Invite
        const { data: invite, error: inviteError } = await supabaseAdmin
            .from('invites')
            .select('*')
            .eq('token', token)
            .single()

        if (inviteError || !invite) {
            return new Response(JSON.stringify({ error: 'Invalid token' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (new Date(invite.expires_at) < new Date()) {
            return new Response(JSON.stringify({ error: 'Token expired' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        if (invite.accepted_at) {
            return new Response(JSON.stringify({ error: 'Invite already accepted' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Create Auth User
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: invite.email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: full_name,
            }
        })

        if (createError) {
            console.error('Create User Error:', createError);
            // If user already exists, we might want to handle linkage differently, but for now error
            return new Response(JSON.stringify({ error: createError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        const userId = userData.user.id;

        // 3. Create/Update Profile (Force correct office_id and role from invite)
        // Note: The handle_new_user trigger might have run, so we upsert
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                email: invite.email,
                name: full_name,
                role: invite.role,
                office_id: invite.office_id,
                created_at: new Date(),
                updated_at: new Date()
            })

        if (profileError) {
            console.error('Profile Error:', profileError);
            // Rollback user creation? For MVP, just return error, Manual fix might be needed
            return new Response(JSON.stringify({ error: 'Error creating profile linkage' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 4. Mark Invite Accepted
        await supabaseAdmin
            .from('invites')
            .update({ accepted_at: new Date() })
            .eq('id', invite.id)

        return new Response(JSON.stringify({ success: true, user_id: userId }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
