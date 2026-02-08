create extension if not exists "pgcrypto";

create table if not exists public.user_profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'admin',
  must_change_password boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  address text not null,
  property_class text,
  service_type text,
  size text,
  accumulation text,
  add_ons jsonb,
  quote_low numeric,
  quote_high numeric,
  status text default 'new'
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  address text,
  status text default 'active'
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  scheduled_at timestamptz,
  route_name text,
  crew text,
  status text default 'queued'
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  route_name text,
  status text default 'queued',
  eta_minutes integer
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  invoice_number text,
  client_name text,
  status text default 'net-15',
  amount numeric default 0
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text,
  status text default 'draft',
  reach integer
);

alter table public.user_profiles enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.jobs enable row level security;
alter table public.routes enable row level security;
alter table public.invoices enable row level security;
alter table public.campaigns enable row level security;

create policy "Admin access profiles" on public.user_profiles
  for all using (auth.role() = 'authenticated');

create policy "Admin access leads" on public.leads
  for all using (auth.role() = 'authenticated');

create policy "Admin access clients" on public.clients
  for all using (auth.role() = 'authenticated');

create policy "Admin access jobs" on public.jobs
  for all using (auth.role() = 'authenticated');

create policy "Admin access routes" on public.routes
  for all using (auth.role() = 'authenticated');

create policy "Admin access invoices" on public.invoices
  for all using (auth.role() = 'authenticated');

create policy "Admin access campaigns" on public.campaigns
  for all using (auth.role() = 'authenticated');
