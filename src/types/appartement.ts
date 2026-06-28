export interface Appartement {
  id: string
  nom: string
  adresse: string
  code_postal: string
  ville: string
  created_at: string
}

export interface EtatDesLieuxResume {
  id: string
  appartement_id: string
  created_at: string
  infos_generales: {
    typeMouvement: 'entree' | 'sortie'
    dateEtat: string
    locataire: { nom: string; prenom: string }
  }
}
