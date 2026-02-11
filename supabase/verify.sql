-- Neat Curb verification checks for production hardening.

-- 1) Profiles role constraint
select
  conname as constraint_name
from pg_constraint
where conname = 'profiles_role_check';

-- 2) RLS enabled on core tables
select
  relname as table_name,
  relrowsecurity as rls_enabled
from pg_class
where relname in (
  'profiles',
  'leads',
  'clients',
  'jobs',
  'messages',
  'audit_logs',
  'stripe_events'
)
order by relname;

-- 3) Stripe idempotency table exists
select to_regclass('public.stripe_events') as stripe_events_table;
select to_regclass('public.audit_anchors') as audit_anchors_table;
select to_regclass('public.staff_work_view') as staff_work_view;

-- 3b) Atomic conversion and anchor functions exist
select
  p.proname as function_name
from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public'
  and p.proname in ('convert_lead_to_client_atomic', 'anchor_daily_merkle_root')
order by p.proname;

-- 4) Current admin profile link status
select
  p.id,
  p.email,
  p.role,
  p.must_change_password
from profiles p
where p.email = 'neatcurb@gmail.com';

-- 5) Policy snapshot for sensitive tables
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where tablename in ('clients', 'jobs', 'messages', 'audit_logs', 'stripe_events')
order by tablename, cmd, policyname;
