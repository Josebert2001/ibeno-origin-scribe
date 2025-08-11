
-- Grant admin role to the user with the specified email
insert into public.user_roles (user_id, role)
select u.id, 'admin'::public.app_role
from auth.users u
where u.email = 'robertsunday222@gmail.com'
  and not exists (
    select 1
    from public.user_roles r
    where r.user_id = u.id
      and r.role = 'admin'::public.app_role
  );
