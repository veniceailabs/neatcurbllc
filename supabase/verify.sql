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
