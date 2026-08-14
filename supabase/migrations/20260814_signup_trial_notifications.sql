alter table public.access_grants
  add column if not exists admin_reviewed_at timestamptz;

update public.access_grants
   set admin_reviewed_at = coalesce(admin_reviewed_at, now());

create or replace function public.handle_aula_clara_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null then
    insert into public.access_grants (
      email, display_name, role, status, lifetime, expires_at,
      created_at, updated_at, admin_reviewed_at
    ) values (
      lower(new.email),
      nullif(coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', ''), ''),
      case when lower(new.email) = 'ecomnixx@gmail.com' then 'master' else 'client' end,
      'active',
      lower(new.email) = 'ecomnixx@gmail.com',
      case when lower(new.email) = 'ecomnixx@gmail.com' then null else now() + interval '15 days' end,
      now(), now(),
      case when lower(new.email) = 'ecomnixx@gmail.com' then now() else null end
    )
    on conflict (email) do nothing;
  end if;
  return new;
end;
$$;

revoke all on function public.handle_aula_clara_signup() from public;
revoke all on function public.handle_aula_clara_signup() from anon;
revoke all on function public.handle_aula_clara_signup() from authenticated;

drop trigger if exists on_aula_clara_user_created on auth.users;
create trigger on_aula_clara_user_created
  after insert on auth.users
  for each row execute function public.handle_aula_clara_signup();

grant select, update (admin_reviewed_at) on public.access_grants to authenticated;
