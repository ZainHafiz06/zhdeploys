-- ─────────────────────────────────────────────────────────────────────────
-- High on Java — content schema
--
-- Security model: anyone may READ published rows. Only the owner may write,
-- and only the owner may read drafts. Authorisation lives in Postgres, so a
-- person who discovers /studio gains nothing without the owner account.
--
-- 1. Run this file in the Supabase SQL editor.
-- 2. Set the owner:  select set_config('app.owner_email', 'you@example.com', false);
--    (persisted below in the owners table — edit the insert）
-- 3. Create the owner user once in Authentication → Users. Disable sign-ups
--    in Authentication → Providers → Email.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists owners (
  email text primary key
);

-- ▼ EDIT THIS: the only account allowed to write.
insert into owners (email) values ('knight200699@gmail.com')
on conflict do nothing;

create or replace function is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from owners
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ── projects ────────────────────────────────────────────────────────────
create table if not exists projects (
  id text primary key,
  slug text unique not null,
  title text not null,
  short_title text,
  year text,
  type text,
  role text,
  status text,
  one_liner text,
  summary text,
  description text,
  story_context text,
  stack jsonb not null default '[]',
  responsibilities jsonb not null default '[]',
  outcomes jsonb not null default '[]',
  logo jsonb,
  hero_media jsonb,
  gallery jsonb not null default '[]',
  video jsonb,
  palette jsonb not null default '{"background":"#050505","foreground":"#f2f2f0","accent":"#f2f2f0"}',
  external_url text,
  github_url text,
  case_study_url text,
  blocks jsonb not null default '[]',
  order_index int not null default 0,
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── research ────────────────────────────────────────────────────────────
create table if not exists research (
  id text primary key,
  slug text unique not null,
  title text not null,
  subtitle text,
  related_project_id text references projects (id) on delete set null,
  one_liner text,
  abstract text,
  motivation text,
  research_question text,
  methodology text,
  datasets jsonb not null default '[]',
  models jsonb not null default '[]',
  metrics jsonb not null default '[]',
  results jsonb not null default '[]',
  limitations jsonb not null default '[]',
  figures jsonb not null default '[]',
  paper_url text,
  pdf_url text,
  github_url text,
  status text,
  authors jsonb not null default '[]',
  affiliation text,
  year text,
  order_index int not null default 0,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ── links ───────────────────────────────────────────────────────────────
create table if not exists links (
  id text primary key,
  label text not null,
  url text not null,
  description text,
  icon text,
  order_index int not null default 0,
  visible boolean not null default true,
  open_in_new_tab boolean not null default true
);

-- ── settings (single row) ───────────────────────────────────────────────
create table if not exists settings (
  id int primary key default 1,
  intro_line text not null default 'I make ideas move.',
  ending_line text not null default 'Different projects. Same habit.',
  signature_line text,
  resume_url text,
  seo_title text not null default 'Zain Hafiz — High on Java',
  seo_description text not null default '',
  social_image text,
  transitions jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint settings_single_row check (id = 1)
);

-- ── row level security ──────────────────────────────────────────────────
alter table owners enable row level security;
alter table projects enable row level security;
alter table research enable row level security;
alter table links enable row level security;
alter table settings enable row level security;

drop policy if exists owners_read on owners;
create policy owners_read on owners for select using (is_owner());

drop policy if exists projects_read_published on projects;
create policy projects_read_published on projects
  for select using (published or is_owner());

drop policy if exists projects_write_owner on projects;
create policy projects_write_owner on projects
  for all using (is_owner()) with check (is_owner());

drop policy if exists research_read_published on research;
create policy research_read_published on research
  for select using (published or is_owner());

drop policy if exists research_write_owner on research;
create policy research_write_owner on research
  for all using (is_owner()) with check (is_owner());

drop policy if exists links_read_visible on links;
create policy links_read_visible on links
  for select using (visible or is_owner());

drop policy if exists links_write_owner on links;
create policy links_write_owner on links
  for all using (is_owner()) with check (is_owner());

drop policy if exists settings_read on settings;
create policy settings_read on settings for select using (true);

drop policy if exists settings_write_owner on settings;
create policy settings_write_owner on settings
  for all using (is_owner()) with check (is_owner());

-- ── storage ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_owner_write on storage.objects;
create policy media_owner_write on storage.objects
  for all using (bucket_id = 'media' and is_owner())
  with check (bucket_id = 'media' and is_owner());
