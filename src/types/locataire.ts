export interface Locataire {
  id: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  adresse?: string
  created_at: string
}

export interface AppartementLocataire {
  id: string
  appartement_id: string
  locataire_id: string
  date_entree?: string
  date_sortie?: string
  est_actif: boolean
  locataire: Locataire
}

export interface LocataireAvecStatut extends Locataire {
  lien_id: string
  date_entree?: string
  est_actif: boolean
  // chargé après requête EDL
  a_edl_entree?: boolean
  a_edl_sortie?: boolean
}
