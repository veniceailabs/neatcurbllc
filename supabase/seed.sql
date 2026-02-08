insert into profiles (id, email, role, must_change_password)
select id, email, 'admin', true
from auth.users
where email = 'neatcurb@gmail.com';
