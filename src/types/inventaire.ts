// État physique déclaré par le bailleur
export type EtatPhysique = 'neuf' | 'tres_bon' | 'bon' | 'usage' | 'mauvais'

export const ETAT_PHYSIQUE_LABELS: Record<EtatPhysique, string> = {
  neuf: 'Neuf',
  tres_bon: 'Très bon',
  bon: 'Bon état',
  usage: 'Usagé',
  mauvais: 'Mauvais',
}

export const ETAT_PHYSIQUE_BADGE: Record<EtatPhysique, string> = {
  neuf: 'bg-blue-100 text-blue-700',
  tres_bon: 'bg-green-100 text-green-700',
  bon: 'bg-emerald-50 text-emerald-600',
  usage: 'bg-amber-100 text-amber-700',
  mauvais: 'bg-red-100 text-red-700',
}

export const ETAT_PHYSIQUE_BTN: Record<EtatPhysique, string> = {
  neuf: 'bg-blue-100 text-blue-800 border-blue-400',
  tres_bon: 'bg-green-100 text-green-800 border-green-400',
  bon: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  usage: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  mauvais: 'bg-red-100 text-red-800 border-red-400',
}

// Réponse du locataire
export type InventaireEtat = 'accord' | 'accord_obs' | 'pas_accord'

export const INVENTAIRE_ETAT_LABELS: Record<InventaireEtat, string> = {
  accord: "D'accord",
  accord_obs: 'Avec obs.',
  pas_accord: "Pas d'accord",
}

export const INVENTAIRE_ETAT_COLORS: Record<InventaireEtat, string> = {
  accord: 'bg-green-100 text-green-800 border-green-400',
  accord_obs: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  pas_accord: 'bg-red-100 text-red-800 border-red-400',
}

export interface InventaireItem {
  id: string
  designation: string
  quantite?: string
  noteInitiale?: string
  etatDeclare?: EtatPhysique     // bailleur déclare l'état physique
  etatEntree?: InventaireEtat    // locataire : d'accord / pas d'accord
  observations?: string
}

export interface InventairePiece {
  section: string
  items: InventaireItem[]
}

export type Inventaire = InventairePiece[]

interface InventaireItemDef {
  designation: string
  qte?: string
  noteInitiale?: string
  etatDeclare?: EtatPhysique
}

const INVENTAIRE_DEFAUT: { section: string; items: InventaireItemDef[] }[] = [
  {
    section: 'Entrée',
    items: [
      { designation: 'Meuble rangements chaussures', qte: '4' },
      { designation: 'Luminaire', qte: '1' },
    ],
  },
  {
    section: 'Séjour / Pièce à vivre',
    items: [
      { designation: 'Table à manger', qte: '1' },
      { designation: 'Sièges', qte: '2' },
      { designation: 'Vaisselier', qte: '1' },
      { designation: 'Meuble TV', qte: '1' },
      { designation: 'Bibliothèque', qte: '1' },
      { designation: 'Étagères', qte: '6' },
      { designation: 'Luminaire', qte: '1' },
      { designation: 'Plafonnier' },
      { designation: 'Table basse', qte: '1' },
      { designation: 'Support mural télévision', qte: '1' },
      { designation: 'Support mural écrans', qte: '1' },
    ],
  },
  {
    section: 'Cuisine',
    items: [
      { designation: 'Plaques de cuisson', qte: '1', noteInitiale: '1 sur 3 HS' },
      { designation: 'Four', qte: '1' },
      { designation: 'Réfrigérateur', qte: '1' },
      { designation: 'Luminaire', qte: '1' },
      { designation: 'Plafonnier' },
      { designation: 'Assiettes plates', qte: '4' },
      { designation: 'Assiettes creuses', qte: '4' },
      { designation: 'Tasses', qte: '4' },
      { designation: 'Verres', qte: '6', etatDeclare: 'neuf' },
      { designation: 'Fourchettes', qte: '4', etatDeclare: 'neuf' },
      { designation: 'Couteaux de table', qte: '4', etatDeclare: 'neuf' },
      { designation: 'Couteaux de cuisine', qte: '4', etatDeclare: 'neuf' },
      { designation: 'Cuillères à soupe', qte: '4', etatDeclare: 'neuf' },
      { designation: 'Petites cuillères', qte: '4', etatDeclare: 'neuf' },
      { designation: 'Casseroles (de tailles différentes)', qte: '2', etatDeclare: 'neuf' },
      { designation: 'Poêle', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Faitout / grand récipient', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Planche à découper', qte: '1' },
      { designation: 'Set spatule / louche / écumoire / presse purée', qte: 'lot de 5' },
      { designation: 'Passoire', qte: '1' },
      { designation: 'Saladier', qte: '1' },
      { designation: 'Ouvre-boîte', qte: '1' },
      { designation: 'Tire-bouchon / décapsuleur', qte: '1' },
      { designation: 'Économe', qte: '1' },
      { designation: 'Range-couverts', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Poubelle', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Étagère', qte: '1', noteInitiale: 'Fixation double face – charges légères' },
    ],
  },
  {
    section: 'Chambre',
    items: [
      { designation: 'Lit (cadre + sommier) 140×190 cm', qte: '1' },
      { designation: 'Matelas', qte: '1' },
      { designation: 'Couette ou couverture', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Volets roulants manuels', qte: '1' },
      { designation: 'Placard', qte: '1' },
      { designation: 'Placard intégré' },
      { designation: 'Luminaire', qte: '1' },
      { designation: 'Plafonnier' },
    ],
  },
  {
    section: 'Salle de bain',
    items: [
      { designation: 'Luminaire', qte: '2' },
      { designation: 'Plafonnier + meuble' },
      { designation: 'Rideau de douche', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Étagères', qte: '2' },
    ],
  },
  {
    section: 'WC',
    items: [
      { designation: 'Abattant', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Dérouleur papier toilette', qte: '1' },
      { designation: 'Luminaire', qte: '1' },
      { designation: 'Plafonnier' },
      { designation: 'Placard rangement', qte: '1' },
    ],
  },
  {
    section: 'Parties communes du logement',
    items: [
      { designation: 'Balai et pelle', qte: '1', etatDeclare: 'neuf' },
      { designation: 'Serpillière et seau', qte: '1' },
      { designation: 'Étendoir à linge', qte: '1', etatDeclare: 'neuf' },
    ],
  },
  {
    section: 'Extérieur',
    items: [
      { designation: 'Salon de jardin (1 canapé 2 pl. + 2 fauteuils + 1 table)', qte: '1' },
      { designation: 'Brise vue', qte: '1', noteInitiale: 'À hauteur du garde-corps' },
      { designation: 'Fausse pelouse', qte: '1' },
    ],
  },
]

function defToItems(section: string, items: InventaireItemDef[]): InventaireItem[] {
  return items.map(({ designation, qte, noteInitiale, etatDeclare }) => ({
    id: `${section}__${designation}`,
    designation,
    quantite: qte,
    noteInitiale,
    etatDeclare,
  }))
}

// Default items per piece type — used when creating a new inventory section
import type { TypePiece } from './etatDesLieux'

const ITEMS_PAR_TYPE: Partial<Record<TypePiece, InventaireItemDef[]>> = {
  entree:        INVENTAIRE_DEFAUT.find(s => s.section === 'Entrée')?.items ?? [],
  salon:         INVENTAIRE_DEFAUT.find(s => s.section === 'Séjour / Pièce à vivre')?.items ?? [],
  salle_a_manger:[
    { designation: 'Table à manger', qte: '1' },
    { designation: 'Chaises', qte: '4' },
    { designation: 'Luminaire', qte: '1' },
  ],
  cuisine:       INVENTAIRE_DEFAUT.find(s => s.section === 'Cuisine')?.items ?? [],
  chambre:       INVENTAIRE_DEFAUT.find(s => s.section === 'Chambre')?.items ?? [],
  salle_de_bain: INVENTAIRE_DEFAUT.find(s => s.section === 'Salle de bain')?.items ?? [],
  wc:            INVENTAIRE_DEFAUT.find(s => s.section === 'WC')?.items ?? [],
  couloir:       INVENTAIRE_DEFAUT.find(s => s.section === 'Parties communes du logement')?.items ?? [],
  balcon:        INVENTAIRE_DEFAUT.find(s => s.section === 'Extérieur')?.items ?? [],
  bureau:        [{ designation: 'Bureau', qte: '1' }, { designation: 'Chaise de bureau', qte: '1' }],
  cave:          [],
  garage:        [],
  autre:         [],
}

/** Sync inventory sections with the current piece list.
 *  - Existing sections (matched by nom) are preserved as-is.
 *  - New sections get default items for their piece type.
 *  - Sections for removed pieces are dropped.
 */
export function syncInventaireWithPieces(
  pieces: { type: TypePiece; nom: string }[],
  current: Inventaire,
): Inventaire {
  return pieces.map(({ type, nom }) => {
    const existing = current.find(s => s.section === nom)
    if (existing) return existing
    return {
      section: nom,
      items: defToItems(nom, ITEMS_PAR_TYPE[type] ?? []),
    }
  })
}

export function newInventaireItem(): InventaireItem {
  return { id: `custom__${Date.now()}`, designation: '', quantite: '' }
}
