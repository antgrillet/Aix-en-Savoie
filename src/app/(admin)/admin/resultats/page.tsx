import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SyncButton, SyncProvider } from '@/app/(admin)/admin/equipes/SyncButton'
import { filtreScoresEnAttente } from '@/components/admin/a-traiter'
import { Button } from '@/components/admin/Button'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatusMark, type StatusTone } from '@/components/admin/StatusMark'
import { ilYa, pluriel } from '@/components/admin/temps'
import { requireAdmin } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import {
  ajouterJours,
  bornesSemaine,
  issueMatch,
  jourParis,
  libelleLieu,
  lireSemaine,
  semaineParDefaut,
  type Issue,
  type MatchResultat,
} from '@/lib/resultats-weekend'

export const dynamic = 'force-dynamic'

const FUSEAU_CLUB = 'Europe/Paris'

const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  hour: '2-digit',
  minute: '2-digit',
})

const formatJourBandeau = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const formatJourTitre = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'long' })
const formatJourCourt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', day: 'numeric', month: 'short' })

/** « 28-29 novembre », ou « 31 oct.-1 nov. » à cheval sur deux mois. */
function titreWeekend(lundi: string, format: Intl.DateTimeFormat = formatJourTitre): string {
  const samedi = new Date(`${ajouterJours(lundi, 5)}T00:00:00Z`)
  const dimanche = new Date(`${ajouterJours(lundi, 6)}T00:00:00Z`)
  const debut =
    samedi.getUTCMonth() === dimanche.getUTCMonth() ? String(samedi.getUTCDate()) : format.format(samedi)
  return `${debut}-${format.format(dimanche)}`
}

/* --------------------------------------------------------------------------
 * États d'un match. La couleur dit l'état, le libellé le dit aussi.
 * ------------------------------------------------------------------------ */

type Etat = Issue | 'attente' | 'a-venir' | 'non-communique'

const ETATS: Record<Etat, { libelle: string; tone: StatusTone }> = {
  victoire: { libelle: 'Victoire', tone: 'ok' },
  nul: { libelle: 'Nul', tone: 'neutral' },
  defaite: { libelle: 'Défaite', tone: 'bad' },
  // Joué, non terminé, sans score : la même définition que « À traiter »
  attente: { libelle: 'Score à saisir', tone: 'action' },
  'a-venir': { libelle: 'À venir', tone: 'neutral' },
  // En plateau, la fédération ne publie pas toujours le score d'un match joué
  'non-communique': { libelle: 'Score non communiqué', tone: 'neutral' },
}

function etatMatch(match: MatchResultat, maintenant: Date): Etat {
  const issue = issueMatch(match)
  if (issue) return issue
  if (match.termine) return 'non-communique'
  if (match.date.getTime() > maintenant.getTime()) return 'a-venir'
  return 'attente'
}

const FILTRES = [
  { id: 'tous', libelle: 'Tous' },
  { id: 'sans-score', libelle: 'Sans score' },
  { id: 'a-venir', libelle: 'À venir' },
  { id: 'joues', libelle: 'Joués' },
] as const

type Filtre = (typeof FILTRES)[number]['id']

function lireFiltre(valeur: string | string[] | undefined): Filtre {
  return FILTRES.find((filtre) => filtre.id === valeur)?.id ?? 'tous'
}

function garde(filtre: Filtre, etat: Etat): boolean {
  if (filtre === 'sans-score') return etat === 'attente'
  if (filtre === 'a-venir') return etat === 'a-venir'
  if (filtre === 'joues') return etat === 'victoire' || etat === 'nul' || etat === 'defaite' || etat === 'non-communique'
  return true
}

interface LigneMatch extends MatchResultat {
  competition: string | null
  equipe: { nom: string; categorie: string }
  etat: Etat
}

/* --------------------------------------------------------------------------
 * Cellules
 * ------------------------------------------------------------------------ */

function Score({ match }: { match: LigneMatch }) {
  const issue = issueMatch(match)
  if (!issue) {
    return (
      <span className={cn('adm-num-md', match.etat === 'attente' ? 'text-[color:var(--adm-orange-ink)]' : 'text-[color:var(--adm-control)]')}>
        <span aria-hidden="true">{match.etat === 'attente' ? '– –' : '—'}</span>
        <span className="sr-only">pas de score</span>
      </span>
    )
  }
  return (
    <span className="adm-num-md whitespace-nowrap">
      <span className={cn(issue === 'defaite' && 'text-muted-foreground')}>{match.scoreEquipe}</span>
      <span aria-hidden="true" className="px-1 text-muted-foreground">–</span>
      <span className="sr-only"> à </span>
      <span className={cn(issue === 'victoire' && 'text-muted-foreground')}>{match.scoreAdversaire}</span>
    </span>
  )
}

function Lieu({ match }: { match: LigneMatch }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <StatusMark tone={match.domicile ? 'ink' : 'neutral'} className="shrink-0">
        {match.domicile ? 'Domicile' : 'Extérieur'}
      </StatusMark>
      <span className="truncate text-muted-foreground">{libelleLieu(match.lieu, match.domicile)}</span>
    </span>
  )
}

function Adversaire({ match }: { match: LigneMatch }) {
  return (
    <Link href={`/admin/matchs/${match.id}`} className="adm-row-link font-semibold hover:underline">
      {match.adversaire}
      <span className="sr-only"> : ouvrir la fiche du match pour saisir ou corriger le score</span>
    </Link>
  )
}

/* --------------------------------------------------------------------------
 * Navigation de week-end en week-end
 * ------------------------------------------------------------------------ */

function NavigationSemaines({
  lundi,
  estSemaineParDefaut,
  filtre,
}: {
  lundi: string
  estSemaineParDefaut: boolean
  filtre: Filtre
}) {
  const suffixe = filtre === 'tous' ? '' : `&filtre=${filtre}`
  const precedente = ajouterJours(lundi, -7)
  const suivante = ajouterJours(lundi, 7)
  return (
    <nav aria-label="Changer de week-end" className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:flex sm:flex-wrap">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/resultats?semaine=${precedente}${suffixe}`}>
          <ChevronLeft aria-hidden="true" />
          <span className="sr-only">Week-end précédent : </span>
          {titreWeekend(precedente, formatJourCourt)}
        </Link>
      </Button>
      <h2 className="text-center text-[0.9375rem] font-bold sm:px-1.5 sm:text-[1rem]">
        {titreWeekend(lundi)} {ajouterJours(lundi, 6).slice(0, 4)}
      </h2>
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/resultats?semaine=${suivante}${suffixe}`}>
          <span className="sr-only">Week-end suivant : </span>
          {titreWeekend(suivante, formatJourCourt)}
          <ChevronRight aria-hidden="true" />
        </Link>
      </Button>
      {!estSemaineParDefaut && (
        <Button asChild variant="ghost" size="sm" className="col-span-3 justify-self-start">
          <Link href={`/admin/resultats${filtre === 'tous' ? '' : `?filtre=${filtre}`}`}>Cette semaine</Link>
        </Button>
      )}
    </nav>
  )
}

/* --------------------------------------------------------------------------
 * Tableau groupé par jour (ordinateur) et liste (téléphone)
 * ------------------------------------------------------------------------ */

function grouperParJour(matchs: LigneMatch[]) {
  const jours = new Map<string, LigneMatch[]>()
  for (const match of matchs) {
    const cle = jourParis(match.date)
    jours.set(cle, [...(jours.get(cle) ?? []), match])
  }
  return [...jours.entries()].map(([cle, lignes]) => ({
    cle,
    libelle: `${formatJourBandeau.format(lignes[0].date)} · ${lignes.length} ${pluriel(lignes.length, 'match', 'matchs')}`,
    lignes,
  }))
}

function TableauMatchs({ matchs }: { matchs: LigneMatch[] }) {
  const jours = grouperParJour(matchs)
  return (
    <div className="adm-panel overflow-hidden">
      <table className="adm-table hidden table-fixed lg:table">
        <caption className="sr-only">Matchs et résultats, groupés par jour</caption>
        <thead>
          <tr>
            <th scope="col" className="w-20">Heure</th>
            <th scope="col" className="w-[22%]">Équipe</th>
            <th scope="col">Rencontre</th>
            <th scope="col" className="w-[24%]">Lieu</th>
            <th scope="col" className="w-28">Score</th>
            <th scope="col" className="w-44">Issue</th>
          </tr>
        </thead>
        {jours.map((jour) => (
          <tbody key={jour.cle}>
            <tr className="adm-day">
              <td colSpan={6}>{jour.libelle}</td>
            </tr>
            {jour.lignes.map((match) => (
              <tr key={match.id} data-attention={match.etat === 'attente' ? '' : undefined}>
                <td className="font-semibold tabular-nums">{formatHeure.format(match.date)}</td>
                <td className="leading-tight">
                  <span className="block truncate font-semibold">{match.equipe.nom}</span>
                  <span className="adm-meta block truncate">{match.competition || match.equipe.categorie.trim()}</span>
                </td>
                <td className="truncate">
                  <Adversaire match={match} />
                </td>
                <td>
                  <Lieu match={match} />
                </td>
                <td>
                  <Score match={match} />
                </td>
                <td>
                  <StatusMark tone={ETATS[match.etat].tone}>{ETATS[match.etat].libelle}</StatusMark>
                </td>
              </tr>
            ))}
          </tbody>
        ))}
      </table>

      <div className="lg:hidden">
        {jours.map((jour) => (
          <section key={jour.cle} aria-label={jour.libelle}>
            <h3 className="adm-micro border-b border-border bg-[color:var(--adm-sunken)] px-4 py-2 text-[#3d3a35]">
              {jour.libelle}
            </h3>
            <ul className="adm-rows">
              {jour.lignes.map((match) => (
                <li
                  key={match.id}
                  className={cn('relative px-4 py-3', match.etat === 'attente' && 'bg-[color:var(--adm-orange-wash)]')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 leading-snug">
                      <span className="adm-meta block">
                        {formatHeure.format(match.date)} · <span className="font-semibold text-foreground">{match.equipe.nom}</span>
                      </span>
                      <span className="text-muted-foreground">contre </span>
                      <Adversaire match={match} />
                    </p>
                    <span className="shrink-0 whitespace-nowrap">
                      <Score match={match} />
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusMark tone={ETATS[match.etat].tone}>{ETATS[match.etat].libelle}</StatusMark>
                    <span className="min-w-0 flex-1">
                      <Lieu match={match} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

const selectMatch = {
  id: true,
  adversaire: true,
  date: true,
  lieu: true,
  domicile: true,
  competition: true,
  scoreEquipe: true,
  scoreAdversaire: true,
  termine: true,
  equipe: { select: { nom: true, categorie: true, ordre: true } },
} as const

export default async function ResultatsPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string | string[]; filtre?: string | string[] }>
}) {
  await requireAdmin()

  const { semaine: parametre, filtre: parametreFiltre } = await searchParams
  const maintenant = new Date()
  const filtre = lireFiltre(parametreFiltre)
  const semaineFixee = typeof parametre === 'string'
  const lundi = lireSemaine(semaineFixee ? parametre : undefined, maintenant)
  const { debut, fin } = bornesSemaine(lundi)
  const estSemaineParDefaut = lundi === semaineParDefaut(maintenant)
  // Arrivé depuis « À traiter » sans semaine : tous les scores en attente, toutes semaines confondues
  const vueAttente = filtre === 'sans-score' && !semaineFixee

  const [matchsBruts, equipes, derniereSynchro] = await Promise.all([
    prisma.match.findMany({
      where: vueAttente ? filtreScoresEnAttente(maintenant) : { date: { gte: debut, lt: fin } },
      orderBy: { date: 'asc' },
      select: selectMatch,
    }),
    prisma.equipe.findMany({ where: { published: true }, orderBy: { ordre: 'asc' }, select: { id: true, nom: true } }),
    prisma.syncLog.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
  ])

  const matchs: LigneMatch[] = matchsBruts
    .map((match) => ({ ...match, etat: etatMatch(match, maintenant) }))
    // Même heure : l'ordre des équipes (comme sur le site)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.equipe.ordre - b.equipe.ordre)

  const compte = (f: Filtre) => matchs.filter((match) => garde(f, match.etat)).length
  const visibles = matchs.filter((match) => garde(filtre, match.etat))

  const bilan = { victoire: 0, nul: 0, defaite: 0, attente: 0 }
  for (const match of matchs) {
    if (match.etat in bilan) bilan[match.etat as keyof typeof bilan]++
  }
  const joues = bilan.victoire + bilan.nul + bilan.defaite
  // Rien de joué ni à saisir : pas de bilan, les zéros ne disent rien
  const totaux: { nombre: number; libelle: string; tone?: string }[] =
    vueAttente || joues + bilan.attente === 0
    ? []
    : [
        { nombre: joues, libelle: pluriel(joues, 'joué ce week-end', 'joués ce week-end') },
        ...(joues > 0
          ? [
              { nombre: bilan.victoire, libelle: pluriel(bilan.victoire, 'victoire', 'victoires'), tone: bilan.victoire > 0 ? 'text-[color:var(--adm-ok)]' : undefined },
              ...(bilan.nul > 0 ? [{ nombre: bilan.nul, libelle: pluriel(bilan.nul, 'nul', 'nuls') }] : []),
              { nombre: bilan.defaite, libelle: pluriel(bilan.defaite, 'défaite', 'défaites'), tone: bilan.defaite > 0 ? 'text-[color:var(--adm-bad)]' : undefined },
            ]
          : []),
        {
          nombre: bilan.attente,
          libelle: pluriel(bilan.attente, 'score à saisir', 'scores à saisir'),
          tone: bilan.attente > 0 ? 'text-[color:var(--adm-orange-ink)]' : undefined,
        },
      ]

  const nomsEnLice = new Set(matchs.map((match) => match.equipe.nom))
  const auRepos = vueAttente ? [] : equipes.filter((equipe) => !nomsEnLice.has(equipe.nom))
  // Les filtres restent sur la semaine affichée : leurs compteurs sont ceux de la semaine
  const lienFiltre = (f: Filtre) => {
    const params = new URLSearchParams({ semaine: lundi })
    if (f !== 'tous') params.set('filtre', f)
    return `/admin/resultats?${params}`
  }

  return (
    <SyncProvider>
      <PageHeader
        title="Résultats"
        description={`Les scores arrivent avec la synchronisation FFHandball${derniereSynchro ? ` (dernière ${ilYa(derniereSynchro.createdAt, maintenant)})` : ''}. Pour saisir ou corriger un score, ouvrez le match en cliquant sur l'adversaire.`}
        actions={<SyncButton />}
      />

      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {vueAttente ? (
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1rem] font-bold">Scores en attente · 30 derniers jours</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/resultats">Revenir au week-end</Link>
            </Button>
          </div>
        ) : (
          <NavigationSemaines lundi={lundi} estSemaineParDefaut={estSemaineParDefaut} filtre={filtre} />
        )}
        {!vueAttente && (
          <nav aria-label="Filtrer les matchs" className="adm-seg w-full self-start sm:w-auto [&>*]:flex-1 [&>*]:justify-center max-sm:[&>*]:px-2 sm:[&>*]:flex-none">
            {FILTRES.map((f) => (
              <Link key={f.id} href={lienFiltre(f.id)} aria-current={filtre === f.id ? 'page' : undefined}>
                {f.libelle}
                <small>{compte(f.id)}</small>
              </Link>
            ))}
          </nav>
        )}
      </div>

      {totaux.length > 0 && matchs.length > 0 && (
        <dl aria-label="Bilan du week-end" className="mb-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap">
          {totaux.map((total) => (
            <div key={total.libelle} className="adm-panel flex flex-col-reverse px-4 py-2.5 sm:min-w-32">
              <dt className="adm-meta">{total.libelle}</dt>
              <dd className={cn('adm-num-md', total.tone)}>{total.nombre}</dd>
            </div>
          ))}
        </dl>
      )}

      {visibles.length === 0 ? (
        <EmptyState
          title={
            matchs.length === 0
              ? vueAttente
                ? 'Aucun score en attente'
                : 'Aucun match enregistré sur ce week-end'
              : 'Aucun match pour ce filtre'
          }
          action={
            matchs.length > 0 ? (
              <Button asChild variant="outline">
                <Link href={lienFiltre('tous')}>Voir tous les matchs</Link>
              </Button>
            ) : (
              !estSemaineParDefaut && (
                <Button asChild variant="outline">
                  <Link href="/admin/resultats">Revenir à cette semaine</Link>
                </Button>
              )
            )
          }
        >
          <p>
            {vueAttente
              ? 'Tous les matchs joués ces 30 derniers jours ont leur score.'
              : 'Aucune équipe ne joue ce week-end, ou les matchs ne sont pas encore synchronisés.'}
          </p>
        </EmptyState>
      ) : (
        <TableauMatchs matchs={visibles} />
      )}

      {auRepos.length > 0 && (
        <p className="adm-meta mt-4">
          <span className="font-semibold text-foreground">
            Sans match cette semaine ({auRepos.length}) :
          </span>{' '}
          {auRepos.map((equipe) => equipe.nom).join(', ')}
        </p>
      )}
    </SyncProvider>
  )
}
