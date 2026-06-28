-- Table appartements
create table if not exists public.appartements (
  id uuid primary key default gen_random_uuid(),
  nom varchar(100) not null,
  adresse varchar(200) not null,
  code_postal varchar(10) not null,
  ville varchar(100) not null,
  created_at timestamptz not null default now()
);

-- FK appartement sur etats_des_lieux
alter table public.etats_des_lieux
  add column if not exists appartement_id uuid references public.appartements(id) on delete set null;

create index if not exists idx_edl_appartement_id on public.etats_des_lieux (appartement_id);

-- RLS appartements
alter table public.appartements enable row level security;

create policy "Lecture authentifiée" on public.appartements
  for select using (auth.role() = 'authenticated');

create policy "Insertion authentifiée" on public.appartements
  for insert with check (auth.role() = 'authenticated');

create policy "Mise à jour authentifiée" on public.appartements
  for update using (auth.role() = 'authenticated');

-- Appartement initial
insert into public.appartements (nom, adresse, code_postal, ville)
values ('D13 Carré Salambo', '412 rue Gustave Flaubert', '34070', 'Montpellier');
