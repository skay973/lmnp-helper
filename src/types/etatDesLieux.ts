export type Etat = 'bon' | 'usage' | 'mauvais' | 'non_applicable'

export interface PhotoItem {
  id: string
  url: string
  caption?: string
}

export interface ElementEtat {
  etat: Etat
  commentaire?: string
  photos: PhotoItem[]
}

export interface PieceSection {
  [elementKey: string]: ElementEtat
}

export interface Piece {
  nom: string
  type: TypePiece
  sections: {
    sols: PieceSection
    murs: PieceSection
    plafond: PieceSection
    portes: PieceSection
    fenetres: PieceSection
    electricite: PieceSection
    plomberie: PieceSection
    rangements: PieceSection
    equipements: PieceSection
    autres: PieceSection
  }
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
    telephone?: string
  }
  releveCompteurs: {
    electricite?: string
    gaz?: string
    eau?: string
    eau_chaude?: string
  }
  nombreCles: number
  nombreBadges: number
  autresRemises?: string
}

export interface EtatDesLieux {
  id?: string
  appartementId?: string
  infosGenerales: InfosGenerales
  pieces: Piece[]
  observations?: string
  signatureLocataire?: string
  signatureBailleur?: string
  createdAt?: string
  updatedAt?: string
}

export const ELEMENTS_PAR_SECTION: Record<string, string[]> = {
  sols: ['Revêtement', 'Propreté', 'État général'],
  murs: ['Peinture / Papier peint', 'Propreté', 'Fissures'],
  plafond: ['Peinture', 'Propreté', 'Fissures', 'Moisissures'],
  portes: ['Porte', 'Poignée / Serrure', 'Huisserie', 'Joint'],
  fenetres: ['Vitrage', 'Cadre / Menuiserie', 'Poignée / Fermeture', 'Volets / Store'],
  electricite: ['Interrupteurs', 'Prises', 'Luminaires', 'Tableau électrique'],
  plomberie: ['Robinets', 'Évacuation', 'Joints / Étanchéité'],
  rangements: ['Placards', 'Étagères', 'Portes de rangement'],
  equipements: ['Cuisine / Électroménager', 'Salle de bain / Sanitaires', 'Radiateur / Chauffage', 'VMC / Ventilation'],
  autres: [],
}

export const PIECES_DEFAUT: Omit<Piece, 'nom'>[] = []

export const TYPE_PIECE_LABELS: Record<TypePiece, string> = {
  entree: 'Entrée',
  salon: 'Salon',
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
  bon: 'Bon état',
  usage: 'Usage normal',
  mauvais: 'Mauvais état',
  non_applicable: 'N/A',
}

export const ETAT_COLORS: Record<Etat, string> = {
  bon: 'bg-green-100 text-green-800 border-green-300',
  usage: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  mauvais: 'bg-red-100 text-red-800 border-red-300',
  non_applicable: 'bg-gray-100 text-gray-500 border-gray-300',
}
