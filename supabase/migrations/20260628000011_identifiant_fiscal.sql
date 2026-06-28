update public.appartements
set config = jsonb_set(config, '{identifiant_fiscal}', '"3009658716"')
where nom = 'D13 Carré Salambo';
