-- Table de liaison user <-> appartement (many-to-many)
create table if not exists public.user_appartements (
  user_id uuid not null references auth.users(id) on delete cascade,
  appartement_id uuid not null references public.appartements(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, appartement_id)
);

alter table public.user_appartements enable row level security;

create policy "Lecture propre" on public.user_appartements
  for select using (auth.uid() = user_id);

create policy "Insertion propre" on public.user_appartements
  for insert with check (auth.uid() = user_id);

-- Remplacer la RLS "tous les authentifiés" par "membres seulement"
drop policy if exists "Lecture authentifiée" on public.appartements;

create policy "Lecture par membre" on public.appartements
  for select using (
    exists (
      select 1 from public.user_appartements ua
      where ua.appartement_id = appartements.id
        and ua.user_id = auth.uid()
    )
  );

-- Lier D13 à aude.vallain@gmail.com
insert into public.user_appartements (user_id, appartement_id)
select u.id, a.id
from auth.users u
cross join public.appartements a
where u.email = 'aude.vallain@gmail.com'
  and a.nom = 'D13 Carré Salambo'
on conflict do nothing;
