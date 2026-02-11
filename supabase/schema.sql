create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

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

create table audit_anchors (
  id uuid default uuid_generate_v4() primary key,
  anchor_date date unique not null,
  merkle_root text not null,
  log_count integer not null default 0,
  anchored_at timestamp default now()
);

create or replace view staff_work_view as
  select
    jobs.id as work_item_id,
    'job'::text as source,
    clients.name,
    clients.phone,
    clients.address,
    jobs.status
  from jobs
  left join clients on clients.id = jobs.client_id
  union all
  select
    leads.id as work_item_id,
    'lead'::text as source,
    leads.name,
    leads.phone,
    leads.address,
    leads.lead_status as status
  from leads;

create or replace function convert_lead_to_client_atomic(
  p_lead_id uuid,
  p_request_id text default null
)
returns table (
  client_id uuid,
  job_id uuid,
  converted boolean,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead leads%rowtype;
  v_client_id uuid;
  v_job_id uuid;
begin
  select * into v_lead
  from leads
  where id = p_lead_id
  for update;

  if not found then
    raise exception 'lead_not_found';
  end if;

  if v_lead.lead_status = 'converted' and v_lead.client_id is not null then
    return query
      select v_lead.client_id, null::uuid, false, 'already_converted';
    return;
  end if;

  select id into v_client_id
  from clients
  where email is not distinct from v_lead.email
    and phone is not distinct from v_lead.phone
  limit 1;

  if v_client_id is null then
    insert into clients (name, email, phone, address, type)
    values (
      v_lead.name,
      v_lead.email,
      v_lead.phone,
      v_lead.address,
      coalesce(v_lead.pricing_meta->>'propertyClass', null)
    )
    returning id into v_client_id;
  end if;

  insert into jobs (client_id, service, status, scheduled_date)
  values (
    v_client_id,
    coalesce(v_lead.service, 'Onboarding/Property Setup'),
    'queued',
    current_date
  )
  returning id into v_job_id;

  update leads
  set
    lead_status = 'converted',
    converted_at = now(),
    client_id = v_client_id
  where id = v_lead.id;

  insert into audit_logs (action, entity, entity_id, metadata)
  values (
    'lead_converted_atomic',
    'lead',
    v_lead.id,
    jsonb_build_object('client_id', v_client_id, 'job_id', v_job_id, 'request_id', p_request_id)
  );

  return query
    select v_client_id, v_job_id, true, 'converted';
end;
$$;

create or replace function anchor_daily_merkle_root(
  p_anchor_date date default (current_date - 1)
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_merkle_root text;
  v_count integer;
begin
  select count(*) into v_count
  from audit_logs
  where occurred_at::date = p_anchor_date;

  select encode(
           digest(
             coalesce(
               string_agg(
                 encode(
                   digest(
                     concat_ws(
                       '|',
                       id::text,
                       coalesce(actor, ''),
                       action,
                       coalesce(entity, ''),
                       coalesce(entity_id::text, ''),
                       coalesce(metadata::text, ''),
                       to_char(occurred_at, 'YYYY-MM-DD HH24:MI:SS')
                     ),
                     'sha256'
                   ),
                   'hex'
                 ),
                 '' order by occurred_at, id
               ),
               ''
             ),
             'sha256'
           ),
           'hex'
         ) into v_merkle_root
  from audit_logs
  where occurred_at::date = p_anchor_date;

  insert into audit_anchors (anchor_date, merkle_root, log_count)
  values (p_anchor_date, coalesce(v_merkle_root, encode(digest('', 'sha256'), 'hex')), coalesce(v_count, 0))
  on conflict (anchor_date) do update
  set
    merkle_root = excluded.merkle_root,
    log_count = excluded.log_count,
    anchored_at = now();
end;
$$;

do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.schedule(
      'anchor-daily-merkle-root',
      '10 0 * * *',
      $$select anchor_daily_merkle_root(current_date - 1);$$
    );
  end if;
exception when others then
  null;
end
$$;

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
alter table audit_anchors enable row level security;

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

create policy "Admins can read audit anchors"
  on audit_anchors for select
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

grant select on staff_work_view to authenticated;
