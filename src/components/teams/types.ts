/** Équipe telle qu'affichée dans la liste publique, préparée côté serveur. */
export interface EquipeListe {
  id: number
  nom: string
  slug: string
  categorie: string
  photo: string
  /** Rang du club au classement de la poule, null si inconnu. */
  rang: number | null
  /** Créneaux d'entraînement courts : « Mer 20h00–22h00 ». */
  creneaux: string[]
  prochainMatch: {
    adversaire: string
    /** Date déjà formatée à l'heure de Paris : « sam. 28 nov., 20:00 ». */
    date: string
    domicile: boolean
  } | null
}
