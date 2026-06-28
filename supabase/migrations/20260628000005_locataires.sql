-- Table locataires
create table if not exists public.locataires (
  id uuid primary key default gen_random_uuid(),
  nom varchar(100) not null,
  prenom varchar(100) not null,
  email varchar(200),
  telephone varchar(30),
  adresse varchar(300),
  created_at timestamptz not null default now()
);

alter table public.locataires enable row level security;
create policy "Lecture authentifiée" on public.locataires for select using (auth.role() = 'authenticated');
create policy "Insertion authentifiée" on public.locataires for insert with check (auth.role() = 'authenticated');
create policy "Mise à jour authentifiée" on public.locataires for update using (auth.role() = 'authenticated');

-- Historique locataires par appartement
create table if not exists public.appartement_locataires (
  id uuid primary key default gen_random_uuid(),
  appartement_id uuid not null references public.appartements(id) on delete cascade,
  locataire_id uuid not null references public.locataires(id) on delete cascade,
  date_entree date,
  date_sortie date,
  est_actif boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_appt_loc_appartement on public.appartement_locataires (appartement_id);
create index if not exists idx_appt_loc_actif on public.appartement_locataires (appartement_id, est_actif);

alter table public.appartement_locataires enable row level security;
create policy "Lecture authentifiée" on public.appartement_locataires for select using (auth.role() = 'authenticated');
create policy "Insertion authentifiée" on public.appartement_locataires for insert with check (auth.role() = 'authenticated');
create policy "Mise à jour authentifiée" on public.appartement_locataires for update using (auth.role() = 'authenticated');

-- Lier locataire_id aux états des lieux
alter table public.etats_des_lieux
  add column if not exists locataire_id uuid references public.locataires(id) on delete set null;

create index if not exists idx_edl_locataire on public.etats_des_lieux (locataire_id);

-- Insertion du locataire Abdelhamid Alouane et liaison à D13
with loc as (
  insert into public.locataires (nom, prenom, email)
  values ('Alouane', 'Abdelhamid', 'abdelhamid.alouane147@gmail.com')
  returning id
),
appt as (
  select id from public.appartements where nom = 'D13 Carré Salambo' limit 1
)
insert into public.appartement_locataires (appartement_id, locataire_id, date_entree, est_actif)
select appt.id, loc.id, '2026-07-11', true
from loc, appt;
