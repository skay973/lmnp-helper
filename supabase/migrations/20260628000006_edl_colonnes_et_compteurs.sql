-- Colonnes manquantes sur etats_des_lieux (cause de l'erreur de sauvegarde)
alter table public.etats_des_lieux
  add column if not exists parties_privatives jsonb not null default '{}'::jsonb,
  add column if not exists equipements jsonb not null default '{}'::jsonb,
  add column if not exists equipements_energetiques jsonb not null default '{}'::jsonb;

-- Numéros de compteurs dans la config appartement D13
update public.appartements
set config = config || '{
  "compteurs": {
    "electricite_pdl": "",
    "eau_numero": ""
  }
}'::jsonb
where nom = 'D13 Carré Salambo';
