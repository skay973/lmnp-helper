export interface CleItem {
  type: string
  nombre: number
  commentaire?: string
}

export interface AppartementConfig {
  surface?: number
  nb_pieces?: number
  identifiant_fiscal?: string
  bailleur: {
    nom: string
    prenom: string
    email?: string
    adresse?: string
  }
  has_gaz: boolean
  cles_defaut: CleItem[]
  pieces_defaut: string[]
  equipements_communs: string[]
}

export interface Appartement {
  id: string
  nom: string
  adresse: string
  code_postal: string
  ville: string
  config: AppartementConfig
  created_at: string
}

export interface EtatDesLieuxResume {
  id: string
  appartement_id: string
  locataire_id?: string
  created_at: string
  infos_generales: {
    typeMouvement: 'entree' | 'sortie'
    dateEtat: string
    locataire: { nom: string; prenom: string }
  }
}
