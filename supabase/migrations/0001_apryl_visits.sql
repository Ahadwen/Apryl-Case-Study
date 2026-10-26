-- Visit counter for the Apryl case study site. Same project as the Reonic prototype, so everything
-- here is prefixed apryl_ to keep it separate from the reonic_ tables.
--
-- Per-day totals (apryl_visits) plus one row per visit with the browser's time zone, e.g.
-- "Europe/London", as a rough country (apryl_visit_log). No IP address or anything else is stored.

create table if not exists public.apryl_visits (
  day date primary key default current_date,
  visits integer not null default 0,
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now()
);

create table if not exists public.apryl_visit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  time_zone text
);

-- RLS on with no policies: neither table can be read or written directly with the public key.
alter table public.apryl_visits enable row level security;
alter table public.apryl_visit_log enable row level security;

-- The only way in: count one visit. Callable with the public (anon) key from the site.
create or replace function public.apryl_count_visit(p_time_zone text default null)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.apryl_visits (day, visits) values (current_date, 1)
  on conflict (day) do update set visits = apryl_visits.visits + 1, last_at = now();

  -- Only keep values shaped like an IANA time zone name; anything else is stored as null.
  insert into public.apryl_visit_log (time_zone)
  values (case when p_time_zone ~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$' and length(p_time_zone) <= 64 then p_time_zone end);
end;
$$;

revoke all on function public.apryl_count_visit(text) from public;
grant execute on function public.apryl_count_visit(text) to anon, authenticated;
