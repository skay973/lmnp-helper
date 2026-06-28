export type InventaireEtat = 'accord' | 'accord_obs' | 'pas_accord'

export interface InventaireItem {
  id: string
  designation: string
  quantite?: string
  noteInitiale?: string
  etatEntree?: InventaireEtat
  observations?: string
}

export interface InventairePiece {
  section: string
  items: InventaireItem[]
}

export type Inventaire = InventairePiece[]

export const INVENTAIRE_ETAT_LABELS: Record<InventaireEtat, string> = {
  accord: "D'accord",
  accord_obs: "D'accord avec obs.",
  pas_accord: "Pas d'accord",
}

export const INVENTAIRE_ETAT_COLORS: Record<InventaireEtat, string> = {
  accord: 'bg-green-100 text-green-800 border-green-400',
  accord_obs: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  pas_accord: 'bg-red-100 text-red-800 border-red-400',
}

interface InventaireItemDef {
  designation: string
  qte?: string
  noteInitiale?: string
}

const INVENTAIRE_DEFAUT: { section: string; items: InventaireItemDef[] }[] = [
  {
    section: 'Entrée',
    items: [
      { designation: 'Meuble rangements chaussures' },
      { designation: 'Luminaire' },
    ],
  },
  {
    section: 'Séjour / Pièce à vivre',
    items: [
      { designation: 'Table à manger' },
      { designation: 'Sièges' },
      { designation: 'Vaisselier' },
      { designation: 'Meuble TV' },
      { designation: 'Bibliothèque' },
      { designation: 'Étagères' },
      { designation: 'Luminaire' },
      { designation: 'Plafonnier' },
      { designation: 'Table basse' },
      { designation: 'Support mural télévision' },
      { designation: 'Support mural écrans' },
    ],
  },
  {
    section: 'Cuisine',
    items: [
      { designation: 'Plaques de cuisson', noteInitiale: '1 sur 3 HS' },
      { designation: 'Four' },
      { designation: 'Réfrigérateur' },
      { designation: 'Luminaire' },
      { designation: 'Plafonnier' },
      { designation: 'Assiettes plates' },
      { designation: 'Assiettes creuses' },
      { designation: 'Tasses' },
      { designation: 'Verres', noteInitiale: 'Neuf' },
      { designation: 'Fourchettes', noteInitiale: 'Neuf' },
      { designation: 'Couteaux de table', noteInitiale: 'Neuf' },
      { designation: 'Couteaux de cuisine', noteInitiale: 'Neuf' },
      { designation: 'Cuillères à soupe', noteInitiale: 'Neuf' },
      { designation: 'Petites cuillères', noteInitiale: 'Neuf' },
      { designation: 'Casseroles (de tailles différentes)', noteInitiale: 'Neuf' },
      { designation: 'Poêle', noteInitiale: 'Neuf' },
      { designation: 'Faitout / grand récipient', noteInitiale: 'Neuf' },
      { designation: 'Planche à découper' },
      { designation: 'Set spatule / louche / écumoire / presse purée', qte: 'lot de 5' },
      { designation: 'Passoire' },
      { designation: 'Saladier' },
      { designation: 'Ouvre-boîte' },
      { designation: 'Tire-bouchon / décapsuleur' },
      { designation: 'Économe' },
      { designation: 'Range-couverts', noteInitiale: 'Neuf' },
      { designation: 'Poubelle', noteInitiale: 'Neuf' },
      { designation: 'Étagère', noteInitiale: 'Fixation double face – charges légères' },
    ],
  },
  {
    section: 'Chambre',
    items: [
      { designation: 'Lit (cadre + sommier)', qte: '140 × 190 cm' },
      { designation: 'Matelas' },
      { designation: 'Couette ou couverture', noteInitiale: 'Neuf' },
      { designation: 'Volets roulants manuels' },
      { designation: 'Placard' },
      { designation: 'Placard intégré' },
      { designation: 'Luminaire' },
      { designation: 'Plafonnier' },
    ],
  },
  {
    section: 'Salle de bain',
    items: [
      { designation: 'Luminaire' },
      { designation: 'Plafonnier + meuble' },
      { designation: 'Rideau de douche', noteInitiale: 'Neuf' },
      { designation: 'Étagères' },
    ],
  },
  {
    section: 'WC',
    items: [
      { designation: 'Abattant', noteInitiale: 'Neuf' },
      { designation: 'Dérouleur papier toilette' },
      { designation: 'Luminaire' },
      { designation: 'Plafonnier' },
      { designation: 'Placard rangement' },
    ],
  },
  {
    section: 'Parties communes du logement',
    items: [
      { designation: 'Balai et pelle', noteInitiale: 'Neuf' },
      { designation: 'Serpillière et seau' },
      { designation: 'Étendoir à linge', noteInitiale: 'Neuf' },
    ],
  },
  {
    section: 'Extérieur',
    items: [
      { designation: 'Salon de jardin', qte: '1 canapé 2 pl. + 2 fauteuils + 1 table' },
      { designation: 'Brise vue', noteInitiale: 'À hauteur du garde-corps' },
      { designation: 'Fausse pelouse' },
    ],
  },
]

export function createInventaire(): Inventaire {
  return INVENTAIRE_DEFAUT.map(({ section, items }) => ({
    section,
    items: items.map(({ designation, qte, noteInitiale }) => ({
      id: `${section}__${designation}`,
      designation,
      quantite: qte ?? '',
      noteInitiale,
    })),
  }))
}

export function newInventaireItem(): InventaireItem {
  return { id: `custom__${Date.now()}`, designation: '', quantite: '' }
}
