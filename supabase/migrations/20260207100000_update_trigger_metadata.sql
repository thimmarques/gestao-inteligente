-- Update the handle_new_user function to respect office_id and role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, office_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'lawyer'),
    (new.raw_user_meta_data->>'office_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
