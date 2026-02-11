create extension if not exists "uuid-ossp";

create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  role text default 'user',
  must_change_password boolean default true,
  primary key (id),
  constraint profiles_role_check check (role in ('admin', 'staff', 'user'))
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

create table leads (
  id uuid default uuid_generate_v4() primary key,
  name text,
  email text,
  phone text,
  address text,
  service text,
  message text,
  estimated_low numeric,
  estimated_high numeric,
  pricing_meta jsonb,
  lead_status text default 'new',
  converted_at timestamp,
  client_id uuid references clients(id),
  created_at timestamp default now()
);

alter table leads
  add constraint leads_status_check
  check (lead_status in ('new', 'draft', 'converted', 'archived'));

create table jobs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  service text,
  price numeric,
  status text,
  scheduled_date date,
  proof_photo_url text,
  proof_uploaded_at timestamp,
  proof_geo jsonb,
  created_at timestamp default now()
);

alter table jobs
  add constraint jobs_status_check
  check (status is null or status in ('queued', 'in_progress', 'complete', 'cancelled'));

create table estimates (
  id uuid default uuid_generate_v4() primary key,
  lead_id uuid references leads(id),
  client_id uuid references clients(id),
  status text default 'draft',
  total_low numeric,
  total_high numeric,
  created_at timestamp default now()
);

create table estimate_items (
  id uuid default uuid_generate_v4() primary key,
  estimate_id uuid references estimates(id),
  description text,
  quantity numeric default 1,
  unit_price numeric,
  line_total numeric
);

create table invoices (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  status text default 'draft',
  subtotal numeric,
  tax numeric,
  total numeric,
  due_date date,
  created_at timestamp default now()
);

alter table invoices
  add constraint invoices_status_check
  check (status in ('draft', 'sent', 'paid', 'overdue', 'void'));

create table invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id),
  description text,
  quantity numeric default 1,
  unit_price numeric,
  line_total numeric
);

create table payments (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references invoices(id),
  amount numeric,
  method text,
  status text,
  provider text,
  provider_id text,
  created_at timestamp default now()
);

create table stripe_events (
  event_id text primary key,
  type text not null,
  processed_at timestamp default now(),
  payload jsonb
);

create table products (
  id uuid default uuid_generate_v4() primary key,
  name text,
  description text,
  unit_price numeric,
  category text,
  active boolean default true,
  created_at timestamp default now()
);

create table expenses (
  id uuid default uuid_generate_v4() primary key,
  vendor text,
  category text,
  amount numeric,
  expense_date date,
  notes text,
  created_at timestamp default now()
);

create table routes (
  id uuid default uuid_generate_v4() primary key,
  name text,
  route_date date,
  status text default 'draft',
  created_at timestamp default now()
);

create table route_stops (
  id uuid default uuid_generate_v4() primary key,
  route_id uuid references routes(id),
  job_id uuid references jobs(id),
  stop_order integer,
  notes text
);

create table programs (
  id uuid default uuid_generate_v4() primary key,
  name text,
  description text,
  interval text,
  active boolean default true,
  created_at timestamp default now()
);

create table program_steps (
  id uuid default uuid_generate_v4() primary key,
  program_id uuid references programs(id),
  step_order integer,
  title text,
  notes text
);

create table gps_events (
  id uuid default uuid_generate_v4() primary key,
  staff_id uuid references auth.users(id),
  job_id uuid references jobs(id),
  lat numeric,
  lng numeric,
  recorded_at timestamp default now()
);

create table client_portal_users (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  user_id uuid references auth.users(id),
  created_at timestamp default now()
);

create table reminders (
  id uuid default uuid_generate_v4() primary key,
  reminder_type text,
  target_id uuid,
  scheduled_for timestamp,
  status text default 'pending',
  created_at timestamp default now()
);

create table property_metadata (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  square_footage numeric,
  slope text,
  surface_material text,
  obstacles text,
  created_at timestamp default now()
);

create table chemical_logs (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  product_id uuid references products(id),
  applied_at timestamp default now(),
  notes text
);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references clients(id),
  lead_id uuid references leads(id),
  channel text,
  to_address text,
  from_address text,
  subject text,
  body text,
  status text,
  provider_id text,
  sent_by uuid references auth.users(id),
  created_at timestamp default now()
);

create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  occurred_at timestamp default now(),
  actor_id uuid,
  actor text,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb
);

alter table profiles enable row level security;
alter table leads enable row level security;
alter table clients enable row level security;
alter table jobs enable row level security;
alter table estimates enable row level security;
alter table estimate_items enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table stripe_events enable row level security;
alter table products enable row level security;
alter table expenses enable row level security;
alter table routes enable row level security;
alter table route_stops enable row level security;
alter table programs enable row level security;
alter table program_steps enable row level security;
alter table gps_events enable row level security;
alter table client_portal_users enable row level security;
alter table reminders enable row level security;
alter table property_metadata enable row level security;
alter table chemical_logs enable row level security;
alter table audit_logs enable row level security;
alter table messages enable row level security;

create policy "Users can read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can read leads"
  on leads for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Public can insert leads"
  on leads for insert
  with check (true);

create policy "Admins and staff can read clients"
  on clients for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can read jobs"
  on jobs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can insert jobs"
  on jobs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can update jobs"
  on jobs for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins can read estimates"
  on estimates for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert estimates"
  on estimates for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read estimate items"
  on estimate_items for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert estimate items"
  on estimate_items for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read invoices"
  on invoices for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert invoices"
  on invoices for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read invoice items"
  on invoice_items for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert invoice items"
  on invoice_items for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read payments"
  on payments for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert payments"
  on payments for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read products"
  on products for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert products"
  on products for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read expenses"
  on expenses for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert expenses"
  on expenses for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins and staff can read routes"
  on routes for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can insert routes"
  on routes for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can read route stops"
  on route_stops for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can insert route stops"
  on route_stops for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can read programs"
  on programs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can insert programs"
  on programs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can read program steps"
  on program_steps for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins and staff can insert program steps"
  on program_steps for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins can read gps events"
  on gps_events for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins and staff can insert gps events"
  on gps_events for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
    )
  );

create policy "Admins can read client portal users"
  on client_portal_users for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert client portal users"
  on client_portal_users for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read reminders"
  on reminders for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert reminders"
  on reminders for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read property metadata"
  on property_metadata for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert property metadata"
  on property_metadata for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read chemical logs"
  on chemical_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert chemical logs"
  on chemical_logs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read audit logs"
  on audit_logs for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can insert audit logs"
  on audit_logs for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read messages"
  on messages for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "Admins can read stripe events"
  on stripe_events for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_jobs_scheduled_date on jobs(scheduled_date);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_messages_client_id on messages(client_id);

create policy "Admins can insert messages"
  on messages for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
