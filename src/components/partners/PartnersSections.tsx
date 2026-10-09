import { SectionHeader } from '@/components/site/SectionHeader'
import { PartnerCard } from './PartnerCard'

type Partenaire = React.ComponentProps<typeof PartnerCard>['partenaire'] & {
  partenaire_majeur: boolean
}

interface PartnersSectionsProps {
  partenaires: Partenaire[]
}

/** Vitrine des partenaires majeurs puis grille de tous les autres partenaires */
export function PartnersSections({ partenaires }: PartnersSectionsProps) {
  const partenairesMajeurs = partenaires.filter((p) => p.partenaire_majeur)
  const autresPartenaires = partenaires.filter((p) => !p.partenaire_majeur)

  return (
    <div className="space-y-20 md:space-y-24">
      {partenairesMajeurs.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="À nos côtés"
            title="Partenaires majeurs"
            description="Ils soutiennent le club au quotidien et rendent notre projet possible."
          />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partenairesMajeurs.map((partenaire) => (
              <li key={partenaire.id}>
                <PartnerCard partenaire={partenaire} featured />
              </li>
            ))}
          </ul>
        </section>
      )}

      {autresPartenaires.length > 0 && (
        <section>
          {partenairesMajeurs.length > 0 ? (
            <SectionHeader
              eyebrow="Le réseau"
              title="Tous nos partenaires"
              description="Commerces, entreprises et institutions locales engagés pour le handball aixois."
            />
          ) : (
            <h2 className="sr-only">Nos partenaires</h2>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {autresPartenaires.map((partenaire) => (
              <li key={partenaire.id}>
                <PartnerCard partenaire={partenaire} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
