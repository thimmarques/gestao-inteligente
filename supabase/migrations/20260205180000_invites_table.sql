-- Create Invites Table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lawyer', 'assistant', 'intern')),
  token TEXT UNIQUE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Safely ensure columns exist if table already existed (Fix for 'relation already exists' but missing cols)
DO $$
BEGIN
  -- Check and Add 'token'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='token') THEN
     ALTER TABLE public.invites ADD COLUMN token TEXT UNIQUE;
  END IF;

  -- Check and Add 'created_by'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='created_by') THEN
     ALTER TABLE public.invites ADD COLUMN created_by UUID REFERENCES auth.users(id);
     -- We might need to handle NOT NULL constraints if data exists, but for now allow nullable on backfill or set default?
     -- The original schema said NOT NULL, but if we are patching, we might need to be careful.
     -- Let's just add it. If it fails due to existing rows being null, user might need to truncate.
     -- Assuming empty or dev data.
  END IF;
  
  -- Check and Add 'office_id'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='office_id') THEN
     ALTER TABLE public.invites ADD COLUMN office_id UUID REFERENCES public.offices(id);
  END IF;

   -- Check and Add 'role'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='role') THEN
     ALTER TABLE public.invites ADD COLUMN role TEXT CHECK (role IN ('admin', 'lawyer', 'assistant', 'intern'));
  END IF;

  -- Check and Add 'accepted_at'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='accepted_at') THEN
     ALTER TABLE public.invites ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Check and Add 'expires_at'
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='expires_at') THEN
     ALTER TABLE public.invites ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_office_id ON public.invites(office_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Admins can manage all invites for their office
CREATE POLICY "Admins can manage office invites" ON public.invites
  FOR ALL
  TO authenticated
  USING (
    office_id = public.get_auth_office_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Lawyers can INSERT invites for assistants/interns only
CREATE POLICY "Lawyers can invite staff" ON public.invites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    office_id = public.get_auth_office_id() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'lawyer'
    ) AND
    role IN ('assistant', 'intern')
  );

-- 3. Lawyers can VIEW invites they created (optional, good for UI)
CREATE POLICY "Creators can view their invites" ON public.invites
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());
