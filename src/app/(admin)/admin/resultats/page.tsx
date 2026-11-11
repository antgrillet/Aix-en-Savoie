import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatusMark, type StatusTone } from '@/components/admin/StatusMark'
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

const formatJourCourt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
})

const formatSynchro = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

/** « 14 et 15 novembre », ou « 31 octobre et 1 novembre » à cheval sur deux mois. */
function titreWeekend(lundi: string, format: Intl.DateTimeFormat = formatJourTitre): string {
  const jourSamedi = new Date(`${ajouterJours(lundi, 5)}T00:00:00Z`)
  const jourDimanche = new Date(`${ajouterJours(lundi, 6)}T00:00:00Z`)
  const debut =
    jourSamedi.getUTCMonth() === jourDimanche.getUTCMonth()
      ? String(jourSamedi.getUTCDate())
      : format.format(jourSamedi)
  return `${debut} et ${format.format(jourDimanche)}`
}

function pluriel(nombre: number, singulier: string, plurielle: string) {
  return nombre > 1 ? plurielle : singulier
}

/* --------------------------------------------------------------------------
 * Ligne de match. Chaque ligne est sa propre grille, aux largeurs fixes : les
 * heures, les scores et les issues s'alignent d'une équipe à l'autre.
 * Sur téléphone : score et issue d'abord, puis l'adversaire, puis la date.
 * ------------------------------------------------------------------------ */

const grilleLigne =
  'grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 md:grid-cols-[6rem_5rem_11.5rem_minmax(0,1fr)]'

const celluleDate = 'col-span-2 row-start-3 md:col-span-1 md:col-start-1 md:row-start-1'
const celluleScore = 'row-start-1 md:col-start-2'
const celluleIssue = 'row-start-1 justify-self-start md:col-start-3'
const celluleAdversaire = 'col-span-2 row-start-2 min-w-0 md:col-span-1 md:col-start-4 md:row-start-1'

// Victoire : bloc plein (fait marquant). Nul et défaite : contour plein, le
// score dit lequel des deux. Jamais de vert ni de rouge.
const ISSUES: Record<Issue, { libelle: string; tone: StatusTone }> = {
  victoire: { libelle: 'Victoire', tone: 'fill' },
  nul: { libelle: 'Nul', tone: 'solid' },
  defaite: { libelle: 'Défaite', tone: 'solid' },
}

/** Score en chiffres tabulaires, tirets alignés ; un trait pointillé tant qu'il manque. */
function Score({ match, className }: { match: MatchResultat; className?: string }) {
  const issue = issueMatch(match)

  if (!issue) {
    return (
      <span className={cn('flex h-6 w-20 items-center', className)}>
        <span aria-hidden="true" className="adm-rule adm-rule--dashed w-full text-foreground" />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'adm-num-md grid w-20 grid-cols-[1fr_auto_1fr] items-baseline gap-x-1.5',
        className
      )}
    >
      <span
        className={cn(
          'text-right',
          issue === 'victoire' && 'font-bold',
          issue === 'defaite' && 'text-muted-foreground'
        )}
      >
        {match.scoreEquipe}
      </span>
      <span aria-hidden="true" className="text-muted-foreground">
        –
      </span>
      <span className="sr-only"> à </span>
      <span
        className={cn(
          'text-left',
          issue === 'defaite' && 'font-bold',
          issue === 'victoire' && 'text-muted-foreground'
        )}
      >
        {match.scoreAdversaire}
      </span>
    </span>
  )
}

/** Issue du match, ou la raison pour laquelle le score manque (provisoire : pointillé). */
function MarqueIssue({
  match,
  maintenant,
  className,
}: {
  match: MatchResultat
  maintenant: Date
  className?: string
}) {
  const issue = issueMatch(match)

  if (issue) {
    return (
      <StatusMark tone={ISSUES[issue].tone} className={className}>
        {ISSUES[issue].libelle}
      </StatusMark>
    )
  }

  // En plateau, la fédération ne publie pas toujours le score d'un match joué
  if (match.termine) {
    return (
      <StatusMark tone="dashed" className={className}>
        Joué, score non communiqué
      </StatusMark>
    )
  }

  if (match.date.getTime() > maintenant.getTime()) {
    return (
      <StatusMark tone="dashed" className={className}>
        À venir
      </StatusMark>
    )
  }

  // Match joué dont le score n'est pas arrivé : c'est ce que compte « À traiter »
  return (
    <StatusMark tone="action" className={className}>
      Score en attente
    </StatusMark>
  )
}

function Lieu({ lieu, domicile }: { lieu: string; domicile: boolean }) {
  return (
    <span className="flex items-start gap-2">
      <StatusMark tone={domicile ? 'fill' : 'solid'} className="shrink-0">
        {domicile ? 'Domicile' : 'Extérieur'}
      </StatusMark>
      <span className="adm-meta min-w-0 pt-0.5">{libelleLieu(lieu, domicile)}</span>
    </span>
  )
}

function Adversaire({ match }: { match: MatchResultat }) {
  return (
    <>
      <span className="text-muted-foreground">contre </span>
      <Link
        href={`/admin/matchs/${match.id}`}
        className="adm-row-link font-semibold decoration-1 underline-offset-4 hover:underline"
      >
        {match.adversaire}
        <span className="sr-only"> : ouvrir la fiche du match</span>
      </Link>
    </>
  )
}

function LigneRencontre({
  rencontre,
  maintenant,
}: {
  rencontre: Rencontre<MatchResultat>
  maintenant: Date
}) {
  const date = (
    <p className={cn(celluleDate, 'adm-meta md:leading-tight')}>
      <span className="md:block md:font-semibold md:text-foreground">
        {formatJourMatch.format(rencontre.date)}
      </span>
      <span aria-hidden="true" className="md:hidden">
        {' · '}
      </span>
      <span className="md:block">{formatHeure.format(rencontre.date)}</span>
    </p>
  )

  // Un match seul : tout tient sur une ligne
  if (rencontre.matchs.length === 1) {
    const [match] = rencontre.matchs

    return (
      <li className={cn(grilleLigne, 'relative py-3 md:min-h-16 md:py-2.5')}>
        {date}
        <Score match={match} className={celluleScore} />
        <MarqueIssue match={match} maintenant={maintenant} className={celluleIssue} />
        <div className={cn(celluleAdversaire, 'space-y-1')}>
          <p className="leading-snug">
            <Adversaire match={match} />
          </p>
          <Lieu lieu={rencontre.lieu} domicile={rencontre.domicile} />
        </div>
      </li>
    )
  }

  // Un plateau : la salle et le jour une fois, puis une ligne par match
  return (
    <li className="py-3 md:py-2.5">
      <div className={grilleLigne}>
        {date}
        <p className="col-span-2 row-start-1 font-semibold md:col-start-2">
          Plateau de {rencontre.matchs.length} matchs
        </p>
        <div className={celluleAdversaire}>
          <Lieu lieu={rencontre.lieu} domicile={rencontre.domicile} />
        </div>
      </div>

      <ul className="mt-2 space-y-2 md:mt-1.5 md:space-y-1.5">
        {rencontre.matchs.map((match) => (
          <li key={match.id} className={cn(grilleLigne, 'relative')}>
            <span className="adm-meta hidden md:col-start-1 md:row-start-1 md:block">
              {formatHeure.format(match.date)}
            </span>
            <Score match={match} className={celluleScore} />
            <MarqueIssue match={match} maintenant={maintenant} className={celluleIssue} />
            <p className={cn(celluleAdversaire, 'leading-snug')}>
              <Adversaire match={match} />
              <span className="adm-meta md:hidden"> · {formatHeure.format(match.date)}</span>
            </p>
          </li>
        ))}
      </ul>
    </li>
  )
}

/* --------------------------------------------------------------------------
 * Navigation de week-end en week-end. Largeurs fixes : les boutons restent
 * sous le curseur (ou le pouce) quand on enchaîne les semaines.
 * ------------------------------------------------------------------------ */

function NavigationSemaines({ lundi, estSemaineParDefaut }: { lundi: string; estSemaineParDefaut: boolean }) {
  const precedente = ajouterJours(lundi, -7)
  const suivante = ajouterJours(lundi, 7)

  return (
    <nav
      aria-label="Changer de week-end"
      className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0 sm:items-center"
    >
      <Button asChild variant="outline" size="sm" className="sm:w-40">
        <Link href={`/admin/resultats?semaine=${precedente}`}>
          <ChevronLeft aria-hidden="true" />
          <span className="sr-only">Week-end précédent : </span>
          {titreWeekend(precedente, formatJourCourt)}
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="sm:w-40">
        <Link href={`/admin/resultats?semaine=${suivante}`}>
          <span className="sr-only">Week-end suivant : </span>
          {titreWeekend(suivante, formatJourCourt)}
          <ChevronRight aria-hidden="true" />
        </Link>
      </Button>
      {estSemaineParDefaut ? (
        // Déjà sur le week-end en cours : le bouton garde sa place, désactivé
        <Button type="button" variant="outline" size="sm" disabled className="max-sm:hidden">
          Week-end en cours
        </Button>
      ) : (
        <Button asChild variant="outline" size="sm" className="max-sm:col-span-2">
          <Link href="/admin/resultats">
            <span className="sm:hidden">Revenir au week-end en cours</span>
            <span className="max-sm:hidden">Week-end en cours</span>
          </Link>
        </Button>
      )}
    </nav>
  )
}

const grilleEquipe = 'grid gap-x-8 xl:grid-cols-[13rem_minmax(0,1fr)]'

export default async function ResultatsPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string | string[] }>
}) {
  await requireAdmin()

  const { semaine: parametre } = await searchParams
  const maintenant = new Date()
  const lundi = lireSemaine(typeof parametre === 'string' ? parametre : undefined, maintenant)
  const { debut, fin, dimanche } = bornesSemaine(lundi)
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
      // Tant qu'un score manque, le résultat de l'équipe est provisoire
      provisoire: equipe.matchs.some((match) => issueMatch(match) === null),
    }))
  const equipesAuRepos = equipes.filter((equipe) => equipe.matchs.length === 0)

  const matchs = equipesEnLice.flatMap((equipe) => equipe.matchs)
  const bilan = { victoire: 0, nul: 0, defaite: 0 }
  for (const match of matchs) {
    const issue = issueMatch(match)
    if (issue) bilan[issue]++
  }
  const joues = bilan.victoire + bilan.nul + bilan.defaite
  // Joué, non terminé, sans score : la même définition que « À traiter » sur le tableau de bord
  const enAttente = matchs.filter(
    (match) =>
      issueMatch(match) === null && !match.termine && match.date.getTime() <= maintenant.getTime()
  ).length
  // À venir, ou joué en plateau sans score communiqué : rien à saisir
  const sansScore = matchs.length - joues - enAttente

  // Le bilan sur une seule bande : les issues n'apparaissent qu'une fois un score connu
  const totaux: { nombre: number; libelle: string; attend?: boolean }[] = [
    { nombre: matchs.length, libelle: pluriel(matchs.length, 'match', 'matchs') },
    ...(joues > 0
      ? [
          { nombre: bilan.victoire, libelle: pluriel(bilan.victoire, 'victoire', 'victoires') },
          { nombre: bilan.nul, libelle: pluriel(bilan.nul, 'nul', 'nuls') },
          { nombre: bilan.defaite, libelle: pluriel(bilan.defaite, 'défaite', 'défaites') },
        ]
      : []),
    ...(enAttente > 0
      ? [
          {
            nombre: enAttente,
            libelle: pluriel(enAttente, 'score en attente', 'scores en attente'),
            attend: true,
          },
        ]
      : []),
    ...(sansScore > 0 ? [{ nombre: sansScore, libelle: 'sans score' }] : []),
  ]

  return (
    <div>
      <PageHeader
        title="Résultats du week-end"
        description="Les scores de la semaine, équipe par équipe. Ils arrivent avec la synchronisation FFHANDBALL ; pour en saisir un à la main, ouvrez le match en cliquant sur l'adversaire."
      />

      <section aria-labelledby="titre-weekend">
        <div className="flex flex-col gap-x-6 gap-y-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 id="titre-weekend" className="adm-h2">
              Week-end des {titreWeekend(lundi)} {dimanche.slice(0, 4)}
            </h2>
            {derniereSynchro && (
              <p className="adm-meta mt-0.5">
                Dernière synchronisation : {formatSynchro.format(derniereSynchro.createdAt)}
              </p>
            )}
          </div>
          <NavigationSemaines lundi={lundi} estSemaineParDefaut={estSemaineParDefaut} />
        </div>

        {equipesEnLice.length === 0 ? (
          <EmptyState
            title="Aucun match enregistré sur cette semaine"
            className="mt-8"
            action={
              !estSemaineParDefaut && (
                <Button asChild variant="outline">
                  <Link href="/admin/resultats">Revenir au week-end en cours</Link>
                </Button>
              )
            }
          >
            <p>Aucune équipe ne joue ce week-end, ou les matchs ne sont pas encore synchronisés.</p>
          </EmptyState>
        ) : (
          <>
            <dl aria-label="Bilan du week-end" className="mt-6 flex flex-wrap gap-y-4">
              {totaux.map((total) => (
                <div
                  key={total.libelle}
                  className="flex min-w-16 flex-col-reverse justify-end gap-1 border-l border-border px-3 first:border-l-0 first:pl-0 sm:min-w-28 sm:px-4"
                >
                  <dt className="adm-micro">{total.libelle}</dt>
                  <dd className={cn('adm-num-md', total.attend && 'text-primary')}>{total.nombre}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6">
              {equipesEnLice.map((equipe) => (
                <li key={equipe.id} className={cn(grilleEquipe, 'pb-5')}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'adm-rule text-foreground xl:col-span-2',
                      equipe.provisoire && 'adm-rule--dashed'
                    )}
                  />
                  <div className="pt-3 xl:pt-4">
                    <h3 className="adm-h3">{equipe.nom}</h3>
                    <p className="adm-meta">{equipe.categorie.trim()}</p>
                  </div>
                  <ul className="adm-rows pt-1 xl:pt-1.5 [&>*:last-child]:border-b-0">
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
          </>
        )}

        {equipesAuRepos.length > 0 && (
          <div className={cn(grilleEquipe, equipesEnLice.length === 0 && 'mt-4')}>
            <span aria-hidden="true" className="adm-rule text-foreground xl:col-span-2" />
            <h3 className="adm-h3 pt-3 xl:pt-4">
              Sans match cette semaine{' '}
              <span className="adm-num-sm text-muted-foreground">{equipesAuRepos.length}</span>
            </h3>
            <p className="adm-meta pt-1 xl:pt-4 xl:text-[0.9375rem]">
              {equipesAuRepos.map((equipe) => equipe.nom).join(', ')}
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
