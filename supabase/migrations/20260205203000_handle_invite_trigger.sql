-- Migration: Handle Invite Consumption in Trigger
-- Description: Updates handle_new_user to look for pending invites and link user to that office.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_office_id UUID;
  v_role TEXT;
  v_name TEXT;
  v_invite_record RECORD;
BEGIN
  -- 1. Extract basic info
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário');

  -- 2. Check for Pending Invite for this email
  SELECT * INTO v_invite_record
  FROM public.invites
  WHERE email = new.email
    AND status IN ('pending', 'sent')
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invite_record IS NOT NULL THEN
    -- A. Invite Found: Use its Office and Role
    v_office_id := v_invite_record.office_id;
    v_role := v_invite_record.role;

    -- Mark invite as accepted
    UPDATE public.invites
    SET status = 'accepted',
        accepted_at = now()
    WHERE id = v_invite_record.id;
    
  ELSE
    -- B. No Invite: Fallback to creating a new Personal Office (Standard Signup/Bootstrap)
    -- Unless metadata specifically has office_id (rare override)
    
    IF new.raw_user_meta_data->>'office_id' IS NOT NULL THEN
       v_office_id := (new.raw_user_meta_data->>'office_id')::UUID;
       v_role := COALESCE(new.raw_user_meta_data->>'role', 'lawyer');
    ELSE
       INSERT INTO public.offices (name)
       VALUES ('Escritório de ' || v_name)
       RETURNING id INTO v_office_id;
       
       v_role := 'admin'; -- Creator is Admin
    END IF;
  END IF;

  -- 3. Create Identity Profile
  INSERT INTO public.profiles (id, name, email, role, office_id)
  VALUES (
    new.id, 
    v_name, 
    new.email, 
    v_role,
    v_office_id
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    office_id = EXCLUDED.office_id,
    role = EXCLUDED.role;

  RETURN new;
END;
$$;
