-- Apply on existing Supabase projects to align with production hardening.

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
alter table stripe_events enable row level security;

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

create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_jobs_scheduled_date on jobs(scheduled_date);
create index if not exists idx_jobs_status on jobs(status);
create index if not exists idx_messages_client_id on messages(client_id);
