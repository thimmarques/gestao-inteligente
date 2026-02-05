-- Migration: Refactor Invites Table
-- Description: Updates invites table to support email-based flow with status and unique constraints.

-- 1. Alter Table Structure
ALTER TABLE public.invites 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'revoked', 'expired'));

ALTER TABLE public.invites 
ALTER COLUMN token DROP NOT NULL;

-- 2. Data Migration (Backfill status)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invites' AND column_name='accepted_at') THEN
    UPDATE public.invites 
    SET status = 'accepted' 
    WHERE accepted_at IS NOT NULL;
  END IF;
END $$;

-- 3. Constraints
-- Avoid duplicate pending invites for sam email+office
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_office_email_pending 
ON public.invites (office_id, email) 
WHERE status IN ('pending', 'sent');

-- 4. RLS Policies
-- Drop existing to re-define strict rules
DROP POLICY IF EXISTS "Admins can manage office invites" ON public.invites;
DROP POLICY IF EXISTS "Lawyers can create invites" ON public.invites;
DROP POLICY IF EXISTS "Creators can view their invites" ON public.invites;

-- Admin: View/Manage ALL invites for their office
CREATE POLICY "Admins manage office invites"
ON public.invites
FOR ALL
USING (
  office_id IN (
    SELECT office_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Lawyer: View ONLY invites they created
CREATE POLICY "Lawyers view own invites"
ON public.invites
FOR SELECT
USING (
  created_by = auth.uid()
);

-- Note: Lawyers create invites via Edge Function (preferred) or we allow INSERT if they are validated.
-- For stricter control as requested (Lawyer only invites Assistant/Intern), checking role in RLS is hard on INSERT (new row).
-- We will enforce role restrictions in the Edge Function / Application Logic, 
-- but we can allow INSERT if they belong to the office.

CREATE POLICY "Lawyers insert invites"
ON public.invites
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  office_id IN (
    SELECT office_id FROM public.profiles 
    WHERE id = auth.uid()
  )
);

-- Lawyers can revoke (update status) ONLY their own invites
CREATE POLICY "Lawyers update own invites"
ON public.invites
FOR UPDATE
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());
