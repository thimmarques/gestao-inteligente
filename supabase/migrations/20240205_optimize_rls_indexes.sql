-- Migration: Optimize RLS and Indexes
-- Description: Adds missing indexes on foreign keys and optimizes RLS policies using a stable function.

-- 1. Create indexes on Foreign Keys to improve JOIN and RLS performance
-- Impact: CRITICAL (10-100x faster queries on large tables)

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_office_id ON public.profiles(office_id);

-- Clients
CREATE INDEX IF NOT EXISTS idx_clients_office_id ON public.clients(office_id);

-- Cases
CREATE INDEX IF NOT EXISTS idx_cases_office_id ON public.cases(office_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON public.cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at DESC); -- Used for sorting

-- Finance Records
CREATE INDEX IF NOT EXISTS idx_finance_records_office_id ON public.finance_records(office_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_lawyer_id ON public.finance_records(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_client_id ON public.finance_records(client_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_case_id ON public.finance_records(case_id);
CREATE INDEX IF NOT EXISTS idx_finance_records_due_date ON public.finance_records(due_date DESC); -- Used for sorting

-- Deadlines
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON public.deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_lawyer_id ON public.deadlines(lawyer_id);

-- Schedules
CREATE INDEX IF NOT EXISTS idx_schedules_office_id ON public.schedules(office_id);
CREATE INDEX IF NOT EXISTS idx_schedules_lawyer_id ON public.schedules(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_schedules_case_id ON public.schedules(case_id);
CREATE INDEX IF NOT EXISTS idx_schedules_client_id ON public.schedules(client_id);


-- 2. Optimize RLS Policies
-- Create a STABLE function to cache the current user's office_id query for the duration of the statement.
-- Impact: HIGH (Reduces repetitive subqueries for every row checked)

CREATE OR REPLACE FUNCTION public.get_auth_office_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT office_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Update RLS Policies to use the optimized function

-- Clients
DROP POLICY IF EXISTS "Manage clients" ON public.clients;
CREATE POLICY "Manage clients" ON public.clients 
  FOR ALL USING (office_id = get_auth_office_id());

-- Cases
DROP POLICY IF EXISTS "Manage cases" ON public.cases;
CREATE POLICY "Manage cases" ON public.cases 
  FOR ALL USING (office_id = get_auth_office_id());

-- Finance
DROP POLICY IF EXISTS "Manage finance" ON public.finance_records;
CREATE POLICY "Manage finance" ON public.finance_records 
  FOR ALL USING (office_id = get_auth_office_id());

-- Schedules
DROP POLICY IF EXISTS "Manage schedules" ON public.schedules;
CREATE POLICY "Manage schedules" ON public.schedules 
  FOR ALL USING (office_id = get_auth_office_id());

-- Offices
DROP POLICY IF EXISTS "Users can view their office" ON public.offices;
CREATE POLICY "Users can view their office" ON public.offices 
  FOR SELECT USING (id = get_auth_office_id());

-- Deadlines (Optimized with EXISTS and function)
DROP POLICY IF EXISTS "Manage deadlines" ON public.deadlines;
CREATE POLICY "Manage deadlines" ON public.deadlines 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cases
      WHERE cases.id = deadlines.case_id
      AND cases.office_id = get_auth_office_id()
    )
  );
