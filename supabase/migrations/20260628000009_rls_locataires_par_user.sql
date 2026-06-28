-- Restreindre la lecture des locataires aux appartements du user connecté
drop policy if exists "Lecture authentifiée" on public.locataires;

create policy "Lecture par appartement membre" on public.locataires
  for select using (
    exists (
      select 1
      from public.appartement_locataires al
      join public.user_appartements ua on ua.appartement_id = al.appartement_id
      where al.locataire_id = locataires.id
        and ua.user_id = auth.uid()
    )
  );

-- Restreindre la lecture des liens appartement_locataires aux appartements du user
drop policy if exists "Lecture authentifiée" on public.appartement_locataires;

create policy "Lecture par appartement membre" on public.appartement_locataires
  for select using (
    exists (
      select 1 from public.user_appartements ua
      where ua.appartement_id = appartement_locataires.appartement_id
        and ua.user_id = auth.uid()
    )
  );
