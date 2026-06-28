alter table public.appartements
  add column if not exists config jsonb not null default '{}'::jsonb;

update public.appartements
set config = '{
  "surface": 43,
  "nb_pieces": 2,
  "identifiant_fiscal": "3009658716",
  "bailleur": {
    "nom": "Vallain",
    "prenom": "Aude",
    "email": "aude.vallain@gmail.com",
    "adresse": "5 impasse des hirondelles, 29300 Rédéné"
  },
  "has_gaz": false,
  "cles_defaut": [
    { "type": "Clé entrée logement", "nombre": 2 },
    { "type": "Clé accès immeuble / hall", "nombre": 2 },
    { "type": "Badge / télécommande parking", "nombre": 2 },
    { "type": "Clé boîte aux lettres", "nombre": 2 }
  ],
  "pieces_defaut": ["entree", "salon", "cuisine", "chambre", "salle_de_bain", "wc", "balcon"],
  "equipements_communs": ["Sonnette / Interphone", "Boîte aux lettres", "DAAF", "Parking privatif n°33", "Terrasse"]
}'::jsonb
where nom = 'D13 Carré Salambo';
