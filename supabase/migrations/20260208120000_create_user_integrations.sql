create table if not exists public.user_integrations (
  user_id uuid not null primary key,
  provider text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  connected_email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_integrations_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.user_integrations enable row level security;

create policy "Users can view their own integrations"
  on public.user_integrations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own integrations"
  on public.user_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own integrations"
  on public.user_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own integrations"
  on public.user_integrations for delete
  using (auth.uid() = user_id);
