create table if not exists public.matches (
  id text primary key,
  teams text not null,
  match_date date not null,
  match_time text not null,
  venue text not null,
  prices jsonb not null check (jsonb_typeof(prices) = 'object'),
  available_seats integer not null check (available_seats >= 0)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  match_id text not null references public.matches(id),
  customer_name text not null check (length(trim(customer_name)) > 0),
  customer_email text not null check (length(trim(customer_email)) > 0),
  ticket_category text not null,
  quantity integer not null check (quantity between 1 and 10),
  unit_price integer not null check (unit_price > 0),
  total_price bigint not null check (total_price > 0),
  created_at timestamptz not null default now()
);

insert into public.matches (id, teams, match_date, match_time, venue, prices, available_seats)
values
  ('match-01', 'RCB vs MI', '2027-04-05', '7:30 PM', 'Wankhede Stadium, Mumbai',
   '{"General":1500,"Premium":3500,"VIP":7500}', 5000),
  ('match-02', 'CSK vs KKR', '2027-04-06', '7:30 PM', 'M. A. Chidambaram Stadium, Chennai',
   '{"General":1200,"Premium":3000,"VIP":6500}', 5000),
  ('match-03', 'DC vs SRH', '2027-04-07', '7:30 PM', 'Arun Jaitley Stadium, Delhi',
   '{"General":1000,"Premium":2500,"VIP":5500}', 5000)
on conflict (id) do nothing;

alter table public.matches enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Anyone can read matches" on public.matches;
create policy "Anyone can read matches"
  on public.matches for select
  to anon, authenticated
  using (true);

grant select on public.matches to anon, authenticated;
revoke all on public.bookings from anon, authenticated;

create or replace function public.create_booking(
  p_match_id text,
  p_customer_name text,
  p_customer_email text,
  p_ticket_category text,
  p_quantity integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_unit_price integer;
  v_booking_id uuid;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then
    raise exception 'Choose between 1 and 10 tickets.';
  end if;

  if length(trim(coalesce(p_customer_name, ''))) = 0
    or length(trim(p_customer_name)) > 120
    or length(trim(coalesce(p_customer_email, ''))) > 254
    or trim(p_customer_email) !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    raise exception 'Enter a valid name and email address.';
  end if;

  select (prices ->> p_ticket_category)::integer
    into v_unit_price
    from public.matches
    where id = p_match_id;

  if not found or v_unit_price is null or v_unit_price <= 0 then
    raise exception 'The selected ticket type is unavailable.';
  end if;

  update public.matches
    set available_seats = available_seats - p_quantity
    where id = p_match_id and available_seats >= p_quantity;

  if not found then
    raise exception 'Not enough seats are available for this match.';
  end if;

  insert into public.bookings (
    match_id, customer_name, customer_email, ticket_category,
    quantity, unit_price, total_price
  )
  values (
    p_match_id, trim(p_customer_name), trim(p_customer_email), p_ticket_category,
    p_quantity, v_unit_price, v_unit_price::bigint * p_quantity
  )
  returning id into v_booking_id;

  return v_booking_id;
end;
$$;

revoke all on function public.create_booking(text, text, text, text, integer) from public;
grant execute on function public.create_booking(text, text, text, text, integer) to anon, authenticated;

do $$
begin
  if not exists (
    select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;
end;
$$;
