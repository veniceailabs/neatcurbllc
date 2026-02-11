-- Apply on existing Supabase projects to align with production hardening.

create extension if not exists "pgcrypto";
create extension if not exists "pg_cron";

alter table profiles
  add constraint if not exists profiles_role_check
  check (role in ('admin', 'staff', 'user'));

alter table leads
  add constraint if not exists leads_status_check
  check (lead_status in ('new', 'draft', 'converted', 'archived'));

alter table jobs
  add constraint if not exists jobs_status_check
  check (status is null or status in ('queued', 'in_progress', 'complete', 'cancelled'));

alter table invoices
  add constraint if not exists invoices_status_check
  check (status in ('draft', 'sent', 'paid', 'overdue', 'void'));

create table if not exists stripe_events (
  event_id text primary key,
  type text not null,
  processed_at timestamp default now(),
  payload jsonb
);

create table if not exists audit_anchors (
  id uuid default uuid_generate_v4() primary key,
  anchor_date date unique not null,
  merkle_root text not null,
  log_count integer not null default 0,
  anchored_at timestamp default now()
);

alter table stripe_events enable row level security;
alter table audit_anchors enable row level security;

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

grant select on staff_work_view to authenticated;

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

drop policy if exists "Authenticated can read clients" on clients;
drop policy if exists "Authenticated can read jobs" on jobs;
drop policy if exists "Authenticated can insert jobs" on jobs;
drop policy if exists "Authenticated can read routes" on routes;
drop policy if exists "Authenticated can insert routes" on routes;
drop policy if exists "Authenticated can read route stops" on route_stops;
drop policy if exists "Authenticated can insert route stops" on route_stops;
drop policy if exists "Authenticated can read programs" on programs;
drop policy if exists "Authenticated can insert programs" on programs;
drop policy if exists "Authenticated can read program steps" on program_steps;
drop policy if exists "Authenticated can insert program steps" on program_steps;
drop policy if exists "Authenticated can insert gps events" on gps_events;
drop policy if exists "Authenticated can insert audit logs" on audit_logs;
drop policy if exists "Admins and staff can read clients" on clients;
drop policy if exists "Admins and staff can read jobs" on jobs;
drop policy if exists "Admins and staff can insert jobs" on jobs;
drop policy if exists "Admins and staff can update jobs" on jobs;
drop policy if exists "Admins can read stripe events" on stripe_events;
drop policy if exists "Admins and staff can read routes" on routes;
drop policy if exists "Admins and staff can insert routes" on routes;
drop policy if exists "Admins and staff can read route stops" on route_stops;
drop policy if exists "Admins and staff can insert route stops" on route_stops;
drop policy if exists "Admins and staff can read programs" on programs;
drop policy if exists "Admins and staff can insert programs" on programs;
drop policy if exists "Admins and staff can read program steps" on program_steps;
drop policy if exists "Admins and staff can insert program steps" on program_steps;
drop policy if exists "Admins and staff can insert gps events" on gps_events;
drop policy if exists "Admins can insert audit logs" on audit_logs;
drop policy if exists "Admins can read audit anchors" on audit_anchors;

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

create policy "Admins can read stripe events"
  on stripe_events for select
  using (
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

create policy "Admins and staff can insert gps events"
  on gps_events for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'staff')
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

create policy "Admins can read audit anchors"
  on audit_anchors for select
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
