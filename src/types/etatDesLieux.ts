import type { CleItem } from './appartement'

export type Etat = 'bon' | 'usage' | 'mauvais' | 'non_applicable'

export interface ElementEtat {
  etat?: Etat
  commentaire?: string
}

export interface Piece {
  nom: string
  type: TypePiece
  elements: Record<string, ElementEtat>
  commentaireGeneral?: string
}

export type TypePiece =
  | 'entree'
  | 'salon'
  | 'salle_a_manger'
  | 'chambre'
  | 'cuisine'
  | 'salle_de_bain'
  | 'wc'
  | 'couloir'
  | 'bureau'
  | 'balcon'
  | 'cave'
  | 'garage'
  | 'autre'

export interface ReleveCompteurs {
  electricite_pdl?: string
  electricite_hp?: string
  electricite_hc?: string
  eau_froide?: string
  eau_chaude?: string
  gaz?: string
}

export interface InfosGenerales {
  adresse: string
  ville: string
  codePostal: string
  dateEtat: string
  typeMouvement: 'entree' | 'sortie'
  locataire: {
    nom: string
    prenom: string
    email?: string
    telephone?: string
  }
  bailleur: {
    nom: string
    prenom: string
    email?: string
    adresse?: string
  }
  bail?: {
    dateDebut?: string
    duree?: string
  }
  releveCompteurs: ReleveCompteurs
  has_gaz: boolean
  cles: CleItem[]
  equipements_communs?: Record<string, ElementEtat>
}

export interface EtatDesLieux {
  id?: string
  appartementId?: string
  infosGenerales: InfosGenerales
  pieces: Piece[]
  observations?: string
  createdAt?: string
}

// Éléments par type de pièce — alignés sur la trame officielle
export const ELEMENTS_PAR_TYPE_PIECE: Record<TypePiece, string[]> = {
  entree: [
    'Portes / Menuiseries',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Placard',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
  ],
  salon: [
    'Portes / Menuiseries',
    'Fenêtres / Volets / Rideaux',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Placard',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
    'Climatisation',
  ],
  salle_a_manger: [
    'Portes / Menuiseries',
    'Fenêtres / Volets / Rideaux',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
  ],
  cuisine: [
    'Portes / Menuiseries',
    'Fenêtres / Volets',
    'Plafond / Murs',
    'Sol / Plinthes',
    'Rangements / Plan de travail',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
    'Évier / Robinetterie',
    'Plaque de cuisson',
    'Hotte aspirante',
    'Four',
    'Réfrigérateur / Congélateur',
    'VMC',
  ],
  chambre: [
    'Portes / Menuiseries',
    'Fenêtres / Volets / Rideaux',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Placard',
    'Placard intégré',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
    'Climatisation',
  ],
  salle_de_bain: [
    'Portes / Menuiseries',
    'Plafond',
    'Sol / Plinthes',
    'Étagères',
    'Placard',
    'Prises / Interrupteurs',
    'Éclairage / Plafonnier + meuble',
    'Baignoire',
    'Lavabo / Robinetterie',
    'VMC',
  ],
  wc: [
    'Portes / Menuiseries',
    'Plafond',
    'Sol / Plinthes / Murs',
    'Cuvette / Abattant / Chasse d\'eau',
    'Prises / Interrupteurs',
    'Éclairage',
    'VMC',
  ],
  couloir: [
    'Portes / Menuiseries',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
  ],
  bureau: [
    'Portes / Menuiseries',
    'Fenêtres / Volets',
    'Plafond',
    'Sol / Plinthes',
    'Murs',
    'Prises / Interrupteurs',
    'Luminaire / Plafonnier',
  ],
  balcon: [
    'Bloc climatisation',
    'Fausse pelouse',
    'Brise vue',
  ],
  cave: [
    'Porte / Accès',
    'Sol',
    'Murs / Plafond',
    'État général',
  ],
  garage: [
    'Porte / Portail',
    'Sol',
    'Murs / Plafond',
    'Éclairage',
    'État général',
  ],
  autre: [
    'État général',
  ],
}

export const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  entree: 'Entrée',
  salon: 'Séjour / Pièce à vivre',
  salle_a_manger: 'Salle à manger',
  chambre: 'Chambre',
  cuisine: 'Cuisine',
  salle_de_bain: 'Salle de bain',
  wc: 'WC / Toilettes',
  couloir: 'Couloir',
  bureau: 'Bureau',
  balcon: 'Balcon / Terrasse',
  cave: 'Cave',
  garage: 'Garage',
  autre: 'Autre',
}

export const ETAT_LABELS: Record<Etat, string> = {
  bon: 'Bon',
  usage: 'Usage',
  mauvais: 'Mauvais',
  non_applicable: 'N/A',
}

export const ETAT_COLORS: Record<Etat, string> = {
  bon: 'bg-green-100 text-green-800 border-green-400',
  usage: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  mauvais: 'bg-red-100 text-red-800 border-red-400',
  non_applicable: 'bg-gray-100 text-gray-500 border-gray-300',
}

export function createPiece(type: TypePiece, nom: string): Piece {
  const elements: Record<string, ElementEtat> = {}
  for (const el of ELEMENTS_PAR_TYPE_PIECE[type] ?? []) {
    elements[el] = {}
  }
  return { nom, type, elements }
}

export function getPieceCompletion(piece: Piece): { completed: number; total: number } {
  const values = Object.values(piece.elements)
  return { completed: values.filter(e => e.etat).length, total: values.length }
}
