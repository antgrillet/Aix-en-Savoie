import Link from 'next/link'
import { ChevronLeft, ChevronRight, Home, MapPin, Plane } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import {
  ajouterJours,
  bornesSemaine,
  estCategoriePlateau,
  issueMatch,
  libelleLieu,
  lireSemaine,
  regrouperRencontres,
  semaineParDefaut,
  type Issue,
  type MatchResultat,
  type Rencontre,
} from '@/lib/resultats-weekend'

export const dynamic = 'force-dynamic'

const FUSEAU_CLUB = 'Europe/Paris'

const formatJourMatch = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  hour: '2-digit',
  minute: '2-digit',
})

const formatJourTitre = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'long',
})

const formatSynchro = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

function heure(date: Date): string {
  return formatHeure.format(date).replace(':', 'h')
}

/** « 14 et 15 novembre », ou « 31 octobre et 1 novembre » à cheval sur deux mois. */
function titreWeekend(samedi: string, dimanche: string): string {
  const jourSamedi = new Date(`${samedi}T00:00:00Z`)
  const jourDimanche = new Date(`${dimanche}T00:00:00Z`)
  const debut =
    jourSamedi.getUTCMonth() === jourDimanche.getUTCMonth()
      ? String(jourSamedi.getUTCDate())
      : formatJourTitre.format(jourSamedi)
  return `${debut} et ${formatJourTitre.format(jourDimanche)}`
}

const ISSUES: Record<Issue, { libelle: string; classe: string }> = {
  victoire: { libelle: 'Victoire', classe: 'bg-green-100 text-green-800 hover:bg-green-100' },
  nul: { libelle: 'Nul', classe: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-200' },
  defaite: { libelle: 'Défaite', classe: 'bg-red-100 text-red-800 hover:bg-red-100' },
}

function Score({ match, maintenant }: { match: MatchResultat; maintenant: Date }) {
  const issue = issueMatch(match)

  if (!issue) {
    // En plateau, la fédération ne publie pas toujours le score d'un match joué
    const etat = match.termine
      ? 'Joué, score non communiqué'
      : match.date.getTime() > maintenant.getTime()
        ? 'À venir'
        : 'Score en attente'
    return <span className="text-sm text-muted-foreground">{etat}</span>
  }

  return (
    <span className="flex items-center gap-3">
      <span className="text-lg font-bold tabular-nums text-neutral-900">
        {match.scoreEquipe} – {match.scoreAdversaire}
      </span>
      <Badge className={cn('border-transparent shadow-none', ISSUES[issue].classe)}>
        {ISSUES[issue].libelle}
      </Badge>
    </span>
  )
}

function LigneRencontre({
  rencontre,
  maintenant,
}: {
  rencontre: Rencontre<MatchResultat>
  maintenant: Date
}) {
  const estPlateau = rencontre.matchs.length > 1
  const IconeLieu = rencontre.domicile ? Home : Plane

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium text-neutral-900">
          {formatJourMatch.format(rencontre.date)} · {heure(rencontre.date)}
        </span>
        <Badge
          className={cn(
            'gap-1 border-transparent shadow-none',
            rencontre.domicile
              ? 'bg-primary-100 text-primary-800 hover:bg-primary-100'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
          )}
        >
          <IconeLieu className="h-3 w-3" aria-hidden="true" />
          {rencontre.domicile ? 'Domicile' : 'Extérieur'}
        </Badge>
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {libelleLieu(rencontre.lieu, rencontre.domicile)}
        </span>
        {estPlateau && (
          <span className="text-muted-foreground">
            · Plateau, {rencontre.matchs.length} matchs
          </span>
        )}
      </div>

      <ul className={cn('mt-2 space-y-1.5', estPlateau && 'border-l-2 border-primary-200 pl-3')}>
        {rencontre.matchs.map((match) => (
          <li
            key={match.id}
            className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="min-w-0 text-sm text-neutral-700">
              <span className="text-muted-foreground">contre </span>
              <span className="font-medium text-neutral-900">{match.adversaire}</span>
              {estPlateau && (
                <span className="text-muted-foreground"> · {heure(match.date)}</span>
              )}
            </span>
            <Score match={match} maintenant={maintenant} />
          </li>
        ))}
      </ul>
    </li>
  )
}

export default async function ResultatsPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string | string[] }>
}) {
  await requireAdmin()

  const { semaine: parametre } = await searchParams
  const maintenant = new Date()
  const lundi = lireSemaine(typeof parametre === 'string' ? parametre : undefined, maintenant)
  const { debut, fin, samedi, dimanche } = bornesSemaine(lundi)
  const estSemaineParDefaut = lundi === semaineParDefaut(maintenant)

  const [equipes, derniereSynchro] = await Promise.all([
    prisma.equipe.findMany({
      orderBy: { ordre: 'asc' },
      select: {
        id: true,
        nom: true,
        categorie: true,
        matchs: {
          where: { date: { gte: debut, lt: fin } },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            adversaire: true,
            date: true,
            lieu: true,
            domicile: true,
            scoreEquipe: true,
            scoreAdversaire: true,
            termine: true,
          },
        },
      },
    }),
    prisma.syncLog.findFirst({
      where: { status: 'success' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ])

  const equipesEnLice = equipes
    .filter((equipe) => equipe.matchs.length > 0)
    .map((equipe) => ({
      ...equipe,
      rencontres: regrouperRencontres(equipe.matchs, estCategoriePlateau(equipe.categorie)),
    }))
  const equipesAuRepos = equipes.filter((equipe) => equipe.matchs.length === 0)

  const matchs = equipesEnLice.flatMap((equipe) => equipe.matchs)
  const bilan = { victoire: 0, nul: 0, defaite: 0 }
  for (const match of matchs) {
    const issue = issueMatch(match)
    if (issue) bilan[issue]++
  }
  const joues = bilan.victoire + bilan.nul + bilan.defaite

  const resume =
    matchs.length === 0
      ? 'Aucun match enregistré sur cette semaine'
      : [
          `${matchs.length} match${matchs.length > 1 ? 's' : ''}`,
          joues > 0
            ? `${bilan.victoire} victoire${bilan.victoire > 1 ? 's' : ''}, ${bilan.nul} nul${bilan.nul > 1 ? 's' : ''}, ${bilan.defaite} défaite${bilan.defaite > 1 ? 's' : ''}`
            : null,
          matchs.length - joues > 0 ? `${matchs.length - joues} sans score` : null,
        ]
          .filter(Boolean)
          .join(' · ')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Résultats du week-end
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Week-end des {titreWeekend(samedi, dimanche)}
          </p>
        </div>

        <nav aria-label="Changer de week-end" className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/resultats?semaine=${ajouterJours(lundi, -7)}`}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Précédent
            </Link>
          </Button>
          {!estSemaineParDefaut && (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/resultats">Week-end en cours</Link>
            </Button>
          )}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/resultats?semaine=${ajouterJours(lundi, 7)}`}>
              Suivant
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </div>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Par équipe
          </CardTitle>
          <CardDescription>
            {resume}
            {derniereSynchro && (
              <>
                <br />
                Dernière synchronisation : {formatSynchro.format(derniereSynchro.createdAt)}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipesEnLice.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucune équipe ne joue ce week-end, ou les matchs ne sont pas encore synchronisés.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {equipesEnLice.map((equipe) => (
                <li
                  key={equipe.id}
                  className="grid gap-3 py-5 first:pt-0 last:pb-0 md:grid-cols-[14rem_1fr] md:gap-6"
                >
                  <div>
                    <h2 className="font-display text-base font-bold text-neutral-900">
                      {equipe.nom}
                    </h2>
                    <p className="text-sm text-muted-foreground">{equipe.categorie.trim()}</p>
                  </div>
                  <ul className="divide-y divide-neutral-100">
                    {equipe.rencontres.map((rencontre) => (
                      <LigneRencontre
                        key={rencontre.cle}
                        rencontre={rencontre}
                        maintenant={maintenant}
                      />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}

          {equipesAuRepos.length > 0 && (
            <p className="mt-6 border-t border-neutral-200 pt-4 text-sm text-muted-foreground">
              <span className="font-medium text-neutral-700">Sans match cette semaine : </span>
              {equipesAuRepos.map((equipe) => equipe.nom).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
