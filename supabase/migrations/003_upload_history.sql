-- Add last_updated_by and upload history to campaigns
alter table public.campaigns
  add column if not exists last_updated_by text,
  add column if not exists loops_uploads jsonb not null default '[]'::jsonb;
