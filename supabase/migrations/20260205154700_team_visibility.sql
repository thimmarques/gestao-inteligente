-- 1. Update RLS Policy for Team Visibility
-- Allow any authenticated user to view all profiles (Single Office MVP)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Ensure users can still only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- 2. Update Trigger for User Creation
-- Handle 'full_name' from metadata (used in new Signup flow) and fallback to 'name' or default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      'Usuário'
    ), 
    new.email, 
    'lawyer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
