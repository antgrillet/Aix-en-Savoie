import { TeamPhotoCard } from './TeamPhotoCard'
import type { EquipeListe } from './types'

/** Grille des cartes ; sert aussi de rendu serveur avant l'hydratation des filtres. */
export function TeamsGrid({ equipes }: { equipes: EquipeListe[] }) {
  if (equipes.length === 0) {
    return <p className="py-12 text-center text-lg text-zinc-200">Aucune équipe dans cette catégorie.</p>
  }
  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
      {equipes.map((equipe, index) => (
        <li key={equipe.id} id={`equipe-${equipe.id}`} className="flex flex-col [&>article]:flex-1">
          <TeamPhotoCard equipe={equipe} priority={index < 3} />
        </li>
      ))}
    </ul>
  )
}
