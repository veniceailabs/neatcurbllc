-- Ensure pgcrypto functions (digest) resolve inside the anchor function.
alter function public.anchor_daily_merkle_root(date)
set search_path = public, extensions;
