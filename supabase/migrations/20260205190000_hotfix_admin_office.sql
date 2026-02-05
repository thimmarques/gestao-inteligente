-- Migration: Hotfix for Admin Office Assignment
-- Description: Finds admins/users with NULL office_id and creates/assigns an office to them.

DO $$
DECLARE
  r RECORD;
  v_office_id UUID;
BEGIN
  -- Iterate users with NULL office_id
  FOR r IN SELECT * FROM public.profiles WHERE office_id IS NULL LOOP
    
    -- 1. Create Office
    INSERT INTO public.offices (name) 
    VALUES ('Escritório de ' || r.name) 
    RETURNING id INTO v_office_id;
    
    -- 2. Update Profile
    UPDATE public.profiles 
    SET office_id = v_office_id,
        role = 'admin'  -- Ensure they are Admin of their new office
    WHERE id = r.id;
    
    RAISE NOTICE 'Hotfix applied for user %: Created Office %', r.id, v_office_id;
  END LOOP;
END $$;
