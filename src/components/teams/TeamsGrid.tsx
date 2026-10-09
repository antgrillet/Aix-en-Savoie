import { TeamCardDetailed } from './TeamCardDetailed'

type Equipe = React.ComponentProps<typeof TeamCardDetailed>['equipe']

interface TeamsGridProps {
  equipes: Equipe[]
}

/** Grille des cartes d'équipe (sans animation d'apparition : tout est visible dès le chargement) */
export function TeamsGrid({ equipes }: TeamsGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {equipes.map((equipe) => (
        <li key={equipe.id}>
          <TeamCardDetailed equipe={equipe} />
        </li>
      ))}
    </ul>
  )
}
