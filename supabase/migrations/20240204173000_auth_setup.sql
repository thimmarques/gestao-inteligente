-- 1. Create Baseline Tables
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  cnpj TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  site TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Profiles (linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'lawyer' CHECK (role IN ('admin', 'lawyer', 'assistant')),
  oab TEXT,
  office_id UUID REFERENCES public.offices(id),
  photo_url TEXT,
  phone TEXT,
  specialty TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Business Tables
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('particular', 'defensoria')),
  cpf_cnpj TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  photo_url TEXT,
  process_count INTEGER DEFAULT 0,
  notes TEXT,
  financial_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  process_number TEXT NOT NULL,
  court TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  outcome TEXT CHECK (outcome IN ('ganho', 'perdido', 'acordo', 'em_andamento')),
  value NUMERIC DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.finance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  lawyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido')),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  lawyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('baixa', 'média', 'alta', 'urgente')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluído', 'vencido')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  office_id UUID REFERENCES public.offices(id) NOT NULL,
  lawyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('audiência', 'reunião', 'prazo', 'compromisso')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  virtual_link TEXT,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'concluído', 'cancelado')),
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Offices (Users can see their own office)
DROP POLICY IF EXISTS "Users can view their office" ON public.offices;
CREATE POLICY "Users can view their office" ON public.offices 
  FOR SELECT USING (id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid()));

-- Clients
DROP POLICY IF EXISTS "Manage clients" ON public.clients;
CREATE POLICY "Manage clients" ON public.clients 
  FOR ALL USING (office_id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid()));

-- Cases
DROP POLICY IF EXISTS "Manage cases" ON public.cases;
CREATE POLICY "Manage cases" ON public.cases 
  FOR ALL USING (office_id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid()));

-- Finance
DROP POLICY IF EXISTS "Manage finance" ON public.finance_records;
CREATE POLICY "Manage finance" ON public.finance_records 
  FOR ALL USING (office_id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid()));

-- Deadlines
DROP POLICY IF EXISTS "Manage deadlines" ON public.deadlines;
CREATE POLICY "Manage deadlines" ON public.deadlines 
  FOR ALL USING (case_id IN (SELECT id FROM public.cases WHERE office_id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid())));

-- Schedules
DROP POLICY IF EXISTS "Manage schedules" ON public.schedules;
CREATE POLICY "Manage schedules" ON public.schedules 
  FOR ALL USING (office_id IN (SELECT office_id FROM public.profiles WHERE id = auth.uid()));

-- 6. Trigger for New User Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Usuário'), new.email, 'lawyer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup existing trigger/function if needed (optional but safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
