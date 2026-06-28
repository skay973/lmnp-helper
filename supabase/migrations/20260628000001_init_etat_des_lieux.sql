-- Table principale des états des lieux
create table if not exists public.etats_des_lieux (
  id uuid primary key default gen_random_uuid(),
  infos_generales jsonb not null,
  pieces jsonb not null default '[]'::jsonb,
  observations text,
  signature_locataire text,
  signature_bailleur text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index sur la date et le type de mouvement pour les recherches
create index if not exists idx_edl_created_at on public.etats_des_lieux (created_at desc);
create index if not exists idx_edl_type_mouvement on public.etats_des_lieux ((infos_generales->>'typeMouvement'));
create index if not exists idx_edl_adresse on public.etats_des_lieux ((infos_generales->>'adresse'));

-- Mise à jour automatique du updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_etats_des_lieux
  before update on public.etats_des_lieux
  for each row execute function public.set_updated_at();

-- RLS désactivé pour l'instant (accès via anon key sur app locale)
alter table public.etats_des_lieux enable row level security;

create policy "Lecture libre" on public.etats_des_lieux
  for select using (true);

create policy "Insertion libre" on public.etats_des_lieux
  for insert with check (true);

create policy "Mise à jour libre" on public.etats_des_lieux
  for update using (true);
