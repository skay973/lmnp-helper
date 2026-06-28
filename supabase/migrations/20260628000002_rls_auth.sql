-- Remplace les policies "libres" par des policies authentifiées uniquement

drop policy if exists "Lecture libre" on public.etats_des_lieux;
drop policy if exists "Insertion libre" on public.etats_des_lieux;
drop policy if exists "Mise à jour libre" on public.etats_des_lieux;

create policy "Lecture authentifiée" on public.etats_des_lieux
  for select using (auth.role() = 'authenticated');

create policy "Insertion authentifiée" on public.etats_des_lieux
  for insert with check (auth.role() = 'authenticated');

create policy "Mise à jour authentifiée" on public.etats_des_lieux
  for update using (auth.role() = 'authenticated');
