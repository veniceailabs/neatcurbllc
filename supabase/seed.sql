insert into public.user_profiles (id, email, full_name, role, must_change_password)
select id, email, 'Corey', 'admin', true
from auth.users
where email = 'neatcurb@gmail.com'
on conflict (id)
  do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    must_change_password = excluded.must_change_password;
