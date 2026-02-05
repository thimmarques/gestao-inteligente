-- Create Invites Table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'lawyer', 'assistant', 'intern')),
  token TEXT UNIQUE, -- Made nullable initially here to be safe, or we handle it next
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Safely ensure token column exists if table already existed without it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='token') THEN
     ALTER TABLE public.invites ADD COLUMN token TEXT UNIQUE;
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
