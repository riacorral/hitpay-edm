-- Persist uploaded brief images so they survive navigation/reload
alter table public.campaigns
  add column if not exists brief_images jsonb not null default '[]'::jsonb;
