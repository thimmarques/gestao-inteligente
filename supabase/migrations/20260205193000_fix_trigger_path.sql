-- Migration: Fix Trigger Search Path & Reliability
-- Description:
-- 1. Updates handle_new_user to use strict search_path = public (fixes Security Definer warning).
-- 2. Re-applies hotfix for any users still missing office_id.

-- 1. Update Function with fixed search_path
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
  v_meta_office_id TEXT;
  v_meta_role TEXT;
BEGIN
  -- Extract values safely
  v_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário');
  v_meta_office_id := new.raw_user_meta_data->>'office_id';
  v_meta_role := new.raw_user_meta_data->>'role';

  -- Check if office_id is provided in metadata
  IF v_meta_office_id IS NOT NULL AND v_meta_office_id != '' THEN
    v_office_id := v_meta_office_id::UUID;
    v_role := COALESCE(v_meta_role, 'lawyer');
  ELSE
    -- Public Signup: Create a new Office automatically
    -- We prefix with "Escritório de" to be clear
    INSERT INTO public.offices (name)
    VALUES ('Escritório de ' || v_name)
    RETURNING id INTO v_office_id;
    
    v_role := 'admin'; -- Creator of the new office is Admin
  END IF;

  -- Insert Profile
  -- Use ON CONFLICT DO NOTHING purely as a safety net if trigger fires twice
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

-- 2. Ensure Trigger is Bound
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Idempotent Hotfix for Existing Users
-- Runs again to catch any users who might have slipped through or if previous hotfix failed
DO $$
DECLARE
  r RECORD;
  v_office_id UUID;
BEGIN
  FOR r IN SELECT * FROM public.profiles WHERE office_id IS NULL LOOP
    -- Create new office
    INSERT INTO public.offices (name) 
    VALUES ('Escritório de ' || r.name) 
    RETURNING id INTO v_office_id;
    
    -- Update profile
    UPDATE public.profiles 
    SET office_id = v_office_id,
        role = 'admin' 
    WHERE id = r.id;
    
    RAISE NOTICE 'Hotfix re-applied for user %: Created Office %', r.id, v_office_id;
  END LOOP;
END $$;
