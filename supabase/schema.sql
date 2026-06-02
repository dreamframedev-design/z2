-- ============================================================================
-- Z2 GUILD — P1 schema: profiles + idea board + voting
-- Run in the Supabase SQL editor (Dashboard → SQL). Safe to re-run.
-- This is the data spine for "The Commons" in VISION.md.
-- ============================================================================

-- 1) PROFILES — one per auth user (ranks/xp mirror the in-app game mechanics)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  handle     text unique,
  rank       text not null default 'L0',
  xp         integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2) IDEAS — signals submitted to the guild
create table if not exists public.ideas (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid references public.profiles(id) on delete set null,
  world      text not null default 'general',   -- games|sound|film|dreamframe|forge|general
  title      text not null check (char_length(title) between 3 and 140),
  body       text default '',
  status     text not null default 'open',        -- open|queued|building|shipped|archived
  created_at timestamptz not null default now()
);
create index if not exists ideas_world_idx   on public.ideas(world);
create index if not exists ideas_created_idx on public.ideas(created_at desc);

-- 3) VOTES — one per voter per idea (weight enables reputation-weighting later)
create table if not exists public.votes (
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  voter_id   uuid not null references public.profiles(id) on delete cascade,
  weight     integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (idea_id, voter_id)
);

-- 4) SCORES — idea rows with tallied votes (read this from the app)
create or replace view public.idea_scores as
  select i.*, coalesce(sum(v.weight), 0)::int as score, count(v.*)::int as voters
  from public.ideas i
  left join public.votes v on v.idea_id = i.id
  group by i.id;
-- views don't inherit table grants automatically — make it publicly readable
grant select on public.idea_scores to anon, authenticated;

-- 5) Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, handle)
  values (new.id, coalesce(new.raw_user_meta_data->>'handle', 'operator-' || left(new.id::text, 8)))
  on conflict (id) do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- 6) Row Level Security — world-readable, writes gated to the signed-in owner
alter table public.profiles enable row level security;
alter table public.ideas    enable row level security;
alter table public.votes    enable row level security;

drop policy if exists "profiles read"        on public.profiles;
create policy "profiles read"        on public.profiles for select using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "ideas read"          on public.ideas;
create policy "ideas read"          on public.ideas for select using (true);
drop policy if exists "ideas insert"        on public.ideas;
create policy "ideas insert"        on public.ideas for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "ideas author update" on public.ideas;
create policy "ideas author update" on public.ideas for update to authenticated using (auth.uid() = author_id);

drop policy if exists "votes read"   on public.votes;
create policy "votes read"   on public.votes for select using (true);
drop policy if exists "votes insert" on public.votes;
create policy "votes insert" on public.votes for insert to authenticated with check (auth.uid() = voter_id);
drop policy if exists "votes delete" on public.votes;
create policy "votes delete" on public.votes for delete to authenticated using (auth.uid() = voter_id);

-- 7) Seed a few starter signals (optional — delete this block if undesired)
insert into public.ideas (world, title, body) values
  ('sound', 'JamForge: link an Ableton in Sweden to one in Long Beach',
            'Networked low-latency co-creation. Bar-quantized hand-offs over WebRTC + an Ableton Link relay.'),
  ('games', 'A roguelike where the dungeon IS the soundtrack',
            'Procedural levels generated from a track''s stems; each room is a layer.'),
  ('film',  'The Exos — Chapter II open writers room',
            'Guild-voted plot branches for the next chapter.')
on conflict do nothing;

-- 8) Realtime — broadcast votes/new signals to every viewer live.
--    Wrapped so re-running the script never errors if already added.
do $$ begin
  begin alter publication supabase_realtime add table public.ideas; exception when others then null; end;
  begin alter publication supabase_realtime add table public.votes; exception when others then null; end;
end $$;
