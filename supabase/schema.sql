create extension if not exists "uuid-ossp";

create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  role text default 'user',
  must_change_password boolean default true,
  primary key (id)
);

create table leads (
  id uuid default uuid_generate_v4() primary key,
  name text,
  email text,
  phone text,
  address text,
  service text,
  message text,
  created_at timestamp default now()
);

create table clients (
  id uuid default uuid_generate_v4() primary key,
  name text,
  email text,
  phone text,
  address text,
  type text,
  created_at timestamp default now()
);

create table jobs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  service text,
  price numeric,
  status text,
  scheduled_date date,
  created_at timestamp default now()
);

alter table profiles enable row level security;
alter table leads enable row level security;
alter table clients enable row level security;
alter table jobs enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Authenticated can read leads"
  on leads for select
  using (auth.role() = 'authenticated');

create policy "Public can insert leads"
  on leads for insert
  with check (true);

create policy "Authenticated can read clients"
  on clients for select
  using (auth.role() = 'authenticated');

create policy "Authenticated can read jobs"
  on jobs for select
  using (auth.role() = 'authenticated');
