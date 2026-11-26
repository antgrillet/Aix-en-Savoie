export interface NewsArticle {
  id: number
  titre: string
  categorie: string
  date: Date
  image: string
  resume: string
  slug: string
}

// Date courte des actus (« 14 juin 2026 »), fixée sur l'heure du club pour
// qu'un article publié tard le soir ne glisse pas au lendemain côté serveur.
export function formatNewsDate(date: Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  })
}
