import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { PageHeader } from '@/components/admin/PageHeader'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { lireSaison, saisonsEntre } from '@/lib/saisons'
import { getEtendueSaisons, getMatchs } from './actions'
import { MatchsList } from './MatchsList'

/** Valeur du paramètre `?saison=` qui affiche toutes les saisons. */
const TOUTES = 'toutes'

export default async function MatchsPage({
  searchParams,
}: {
  searchParams: Promise<{ saison?: string | string[] }>
}) {
  const { saison: parametre } = await searchParams
  const texte = typeof parametre === 'string' ? parametre : undefined
  const saisonAffichee = await getSaisonAffichee()
  // Par défaut, la saison que voit le public ; « toutes » pour l'historique complet
  const saison = texte === TOUTES ? null : (lireSaison(texte) ?? saisonAffichee)

  const [matchs, etendue] = await Promise.all([getMatchs(saison), getEtendueSaisons()])
  const saisons = etendue
    ? saisonsEntre(
        Math.min(etendue.premiere, saisonAffichee),
        Math.max(etendue.derniere, saisonAffichee)
      )
    : [saisonAffichee]

  // L'heure de référence vient du serveur : la liste dit la même chose au
  // rendu et à l'hydratation (« à venir » ou « score en attente »).
  const maintenant = new Date()

  return (
    <div>
      <PageHeader
        title="Matchs"
        description="Le calendrier du club, saison par saison. Les matchs arrivent avec la synchronisation FFHANDBALL ou s'ajoutent à la main ; seuls les matchs publiés de la saison affichée paraissent sur le site."
        actions={
          <Button asChild>
            <Link href="/admin/matchs/new">
              <Plus aria-hidden="true" />
              Nouveau match
            </Link>
          </Button>
        }
      />

      <MatchsList
        key={saison ?? TOUTES}
        initialMatchs={matchs}
        maintenant={maintenant.getTime()}
        saison={saison === null ? TOUTES : String(saison)}
        saisons={saisons}
        saisonAffichee={saisonAffichee}
      />
    </div>
  )
}
