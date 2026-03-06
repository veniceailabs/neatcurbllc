-- Linter 0010 fix: ensure view uses querying user's privileges, not creator's.
create or replace view public.staff_work_view
with (security_invoker = true) as
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

grant select on public.staff_work_view to authenticated;
