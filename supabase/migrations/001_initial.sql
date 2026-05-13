-- Enable pgcrypto
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
create table public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  name        text,
  avatar_url  text,
  google_sub  text unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users: self only"
  on public.users for all
  using (google_sub = current_setting('request.jwt.claims', true)::json->>'sub');

-- ─────────────────────────────────────────
-- LOOPS CREDENTIALS (encrypted at rest)
-- ─────────────────────────────────────────
create table public.loops_credentials (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade unique,
  loops_api_key_enc text,
  loops_session_enc text,
  updated_at        timestamptz not null default now()
);

alter table public.loops_credentials enable row level security;

create policy "loops_credentials: owner only"
  on public.loops_credentials for all
  using (
    user_id = (
      select id from public.users
      where google_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ─────────────────────────────────────────
-- CAMPAIGNS
-- ─────────────────────────────────────────
create table public.campaigns (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  slug                text not null,
  title               text not null,
  subject             text not null,
  preview_text        text,
  template            text not null,
  markdown            text not null,
  html_content        text,
  mjml_content        text,
  loops_campaign_id   text,
  loops_campaign_url  text,
  status              text not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique(user_id, slug)
);

alter table public.campaigns enable row level security;

create policy "campaigns: owner only"
  on public.campaigns for all
  using (
    user_id = (
      select id from public.users
      where google_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

create index campaigns_user_created
  on public.campaigns (user_id, created_at desc);

-- ─────────────────────────────────────────
-- UPDATED_AT trigger
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_campaigns_updated_at
  before update on public.campaigns
  for each row execute function public.set_updated_at();

create trigger trg_loops_creds_updated_at
  before update on public.loops_credentials
  for each row execute function public.set_updated_at();
