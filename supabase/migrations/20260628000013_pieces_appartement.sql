alter table public.appartements
  add column if not exists pieces jsonb not null default '[]'::jsonb;
