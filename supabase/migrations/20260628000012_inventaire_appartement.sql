alter table public.appartements
  add column if not exists inventaire jsonb not null default '[]'::jsonb;
