-- Add last_updated_by to campaigns
alter table public.campaigns
  add column if not exists last_updated_by text;
