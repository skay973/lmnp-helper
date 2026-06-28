-- Téléphone du locataire Abdelhamid Alouane
update public.locataires
set telephone = '0753826796'
where nom = 'Alouane' and prenom = 'Abdelhamid';

-- Numéros de compteurs réels pour D13 Carré Salambo
update public.appartements
set config = jsonb_set(
  jsonb_set(
    config,
    '{compteurs,electricite_pdl}',
    '"24383067862640"'
  ),
  '{compteurs,eau_numero}',
  '"D08LA336434"'
)
where nom = 'D13 Carré Salambo';
