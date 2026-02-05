-- Migration: Fix Signup Office Assignment
-- Description: Ensures every user has an office.
-- 1. Hotfix: Create offices for existing users with NULL office_id
-- 2. Trigger: Update handle_new_user to auto-create office for public signups

-- 1. Hotfix for existing users
DO $$
DECLARE
  r RECORD;
  v_office_id UUID;
BEGIN
  -- Find profiles without office
  FOR r IN SELECT * FROM public.profiles WHERE office_id IS NULL LOOP
    
    -- Create a new office for this user
    INSERT INTO public.offices (name) 
    VALUES ('Escritório de ' || r.name) 
    RETURNING id INTO v_office_id;
    
    -- Update the profile with the new office info and make them admin
    UPDATE public.profiles 
    SET office_id = v_office_id,
        role = 'admin' 
    WHERE id = r.id;
    
    RAISE NOTICE 'Fixed profile % (Created Office %)', r.id, v_office_id;
  END LOOP;
END $$;

-- 2. Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_office_id UUID;
  v_role TEXT;
  v_name TEXT;
BEGIN
  -- Get name from metadata or default
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário');
  
  -- Check if office_id is provided in metadata (e.g. from Invite)
  -- Note: The Edge Function 'accept-invite' usually handles profile creation directly.
  -- But if we use standard signup with metadata, this covers it.
  IF new.raw_user_meta_data->>'office_id' IS NOT NULL THEN
    v_office_id := (new.raw_user_meta_data->>'office_id')::UUID;
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'lawyer');
  ELSE
    -- Public Signup: Create a new Office
    INSERT INTO public.offices (name)
    VALUES ('Escritório de ' || v_name)
    RETURNING id INTO v_office_id;
    
    v_role := 'admin'; -- Creator of the office is Admin
  END IF;

  -- Insert Profile
  INSERT INTO public.profiles (id, name, email, role, office_id)
  VALUES (
    new.id, 
    v_name, 
    new.email, 
    v_role,
    v_office_id
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
