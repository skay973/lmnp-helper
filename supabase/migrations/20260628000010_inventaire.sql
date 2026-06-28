alter table public.etats_des_lieux
  add column if not exists inventaire jsonb not null default '{}'::jsonb;
