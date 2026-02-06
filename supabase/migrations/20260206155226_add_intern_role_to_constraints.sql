ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['admin'::text, 'lawyer'::text, 'assistant'::text, 'intern'::text]));

ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE public.invites ADD CONSTRAINT invites_role_check CHECK (role = ANY (ARRAY['admin'::text, 'lawyer'::text, 'assistant'::text, 'intern'::text]));
