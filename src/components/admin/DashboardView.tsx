import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SyncButton, SyncProvider } from '@/app/(admin)/admin/equipes/SyncButton'
import type { EtatSynchro } from '@/components/admin/etat-synchro'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader, Section } from '@/components/admin/PageHeader'
import { StatusDot, StatusMark, type StatusTone } from '@/components/admin/StatusMark'
import { formatHeure, formatJourCourt, ilYa, pluriel } from '@/components/admin/temps'
import type { Urgence } from '@/components/admin/urgences'

const formatNombre = new Intl.NumberFormat('fr-FR')

export interface MatchWeekend {
  id: number
  date: Date
  adversaire: string
  lieu: string
  equipe: { nom: string; categorie: string }
  competition: string | null
}

export interface MessageRecent {
  id: number
  nom: string
  prenom: string
  extrait: string
  read: boolean
  createdAt: Date
}

export interface DashboardViewProps {
  maintenant: Date
  /** « 28 et 29 novembre » */
  titreWeekend: string
  saison: string
  urgences: Urgence[]
  domicile: MatchWeekend[]
  exterieur: number
  synchro: EtatSynchro
  messages: MessageRecent[]
  messagesNonLus: number
}

/* --------------------------------------------------------------------------
 * Urgences : une carte par tâche, la plus pressante en premier et plus grosse
 * ------------------------------------------------------------------------ */

function CarteUrgence({ urgence, premiere }: { urgence: Urgence; premiere: boolean }) {
  const enAvant = premiere && (urgence.bloquant || urgence.urgent)
  return (
    <li className="flex">
      <Link
        href={urgence.href}
        className="adm-urgence group w-full"
        data-urgent={urgence.urgent ? '' : undefined}
        data-bloquant={urgence.bloquant ? '' : undefined}
      >
        <span className="flex items-baseline gap-3 sm:block">
          <span
            className={cn(
              enAvant ? 'adm-num-xl' : 'adm-num-lg',
              urgence.bloquant && 'text-[color:var(--adm-bad)]',
              urgence.urgent && 'text-[color:var(--adm-orange-ink)]'
            )}
          >
            {formatNombre.format(urgence.nombre)}
          </span>
          <span className="block font-semibold leading-snug group-hover:underline sm:mt-1">
            {urgence.libelle}
          </span>
        </span>
        <span className="adm-meta block">{urgence.detail}</span>
        <span className="mt-auto pt-2.5">
          <StatusMark tone={urgence.echeance.tone}>{urgence.echeance.texte}</StatusMark>
        </span>
      </Link>
    </li>
  )
}

/* --------------------------------------------------------------------------
 * Week-end au gymnase : les matchs à domicile
 * ------------------------------------------------------------------------ */

function WeekendGymnase({ domicile, exterieur }: { domicile: MatchWeekend[]; exterieur: number }) {
  const lieux = [...new Set(domicile.map((match) => match.lieu.split(',')[0].trim()).filter(Boolean))]
  return (
    <Section
      title="Ce week-end au gymnase"
      count={
        domicile.length > 0
          ? `${domicile.length} ${pluriel(domicile.length, 'match', 'matchs')} à domicile${lieux.length === 1 ? ` · ${lieux[0]}` : ''}`
          : undefined
      }
      action={
        <Link href="/admin/matchs" className="adm-more">
          Matchs <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {domicile.length === 0 ? (
        <EmptyState inset title="Aucun match à domicile ce week-end">
          {exterieur > 0
            ? `${exterieur} ${pluriel(exterieur, 'match', 'matchs')} à l'extérieur.`
            : 'Aucun match enregistré sur ce week-end.'}
        </EmptyState>
      ) : (
        <ul className="adm-rows px-4">
          {domicile.map((match) => (
            <li key={match.id} className="relative py-3">
              <p className="min-w-0 leading-snug">
                <span className="adm-meta block first-letter:uppercase">
                  {formatJourCourt(match.date)} · {formatHeure(match.date)}
                </span>
                <Link href={`/admin/matchs/${match.id}`} className="adm-row-link font-semibold">
                  {match.equipe.nom} <span className="font-normal text-muted-foreground">contre</span> {match.adversaire}
                </Link>
                <span className="adm-meta block truncate">{match.competition || match.equipe.categorie}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

/* --------------------------------------------------------------------------
 * Synchronisation FFHandball : le dernier passage et son journal
 * ------------------------------------------------------------------------ */

function toneJournal(status: string): StatusTone {
  if (status === 'error') return 'bad'
  if (status === 'warning') return 'warn'
  return 'ok'
}

function resumeJournal(ligne: EtatSynchro['journal'][number]): string {
  if (ligne.status === 'error') return ligne.message
  const changes = ligne.crees + ligne.modifies
  return changes === 0
    ? 'aucun changement'
    : `${changes} ${pluriel(changes, 'match créé ou modifié', 'matchs créés ou modifiés')}`
}

function Synchronisation({ synchro, maintenant }: { synchro: EtatSynchro; maintenant: Date }) {
  const { passage } = synchro
  // Les lignes « aucun changement » se répètent : seules les erreurs et les changements s'affichent
  const notables = synchro.journal
    .filter((ligne) => ligne.status !== 'success' || ligne.crees + ligne.modifies > 0)
    .slice(0, 5)
  const chiffres = [
    { nombre: passage.equipes, libelle: pluriel(passage.equipes, 'équipe lue', 'équipes lues') },
    { nombre: passage.modifies, libelle: pluriel(passage.modifies, 'match modifié', 'matchs modifiés') },
    {
      nombre: passage.erreurs,
      libelle: pluriel(passage.erreurs, 'en erreur', 'en erreur'),
      tone: passage.erreurs > 0 ? 'text-[color:var(--adm-bad)]' : undefined,
    },
  ]

  return (
    <SyncProvider>
      <section id="synchro" className="adm-panel scroll-mt-20">
        <div className="adm-panel-head">
          <h2 className="adm-h2">Synchronisation FFHandball</h2>
          <div className="ml-auto">
            <SyncButton />
          </div>
        </div>
        <p className="flex items-center gap-2 px-[1.125rem] pt-3 text-[0.875rem]">
          <StatusDot tone={synchro.tone} />
          <span className="first-letter:uppercase">{synchro.derniere ? synchro.libelle : 'Jamais synchronisé'}</span>
        </p>
        {synchro.derniere && (
          <dl className="grid grid-cols-3 gap-3 border-b border-[color:var(--adm-line-2)] px-[1.125rem] py-3">
            {chiffres.map((chiffre) => (
              <div key={chiffre.libelle} className="flex flex-col-reverse">
                <dt className="adm-meta">{chiffre.libelle}</dt>
                <dd className={cn('adm-num-md', chiffre.tone)}>{formatNombre.format(chiffre.nombre)}</dd>
              </div>
            ))}
          </dl>
        )}
        {synchro.derniere &&
          (notables.length === 0 ? (
            <p className="adm-meta px-[1.125rem] py-3">Dernier passage : aucun changement, aucune erreur.</p>
          ) : (
            <ol aria-label="Journal de synchronisation" className="adm-rows px-[1.125rem] pb-1">
              {notables.map((ligne) => {
                const tone = toneJournal(ligne.status)
                return (
                  <li key={ligne.id} className="flex gap-3 py-2 text-[0.875rem]">
                    <time dateTime={ligne.date.toISOString()} className="w-[5.5rem] shrink-0 text-muted-foreground">
                      {ilYa(ligne.date, maintenant).replace(/^il y a /, '')}
                    </time>
                    <span className="line-clamp-2 min-w-0 flex-1">
                      <span className="font-semibold">{ligne.equipe}</span>
                      {' · '}
                      <span
                        className={cn(
                          tone === 'bad' && 'text-[color:var(--adm-bad)]',
                          tone === 'warn' && 'text-[color:var(--adm-warn)]',
                          tone === 'ok' && 'text-muted-foreground'
                        )}
                      >
                        {tone === 'bad' ? 'Erreur : ' : tone === 'warn' ? 'Avertissement : ' : ''}
                        {resumeJournal(ligne)}
                      </span>
                    </span>
                  </li>
                )
              })}
            </ol>
          ))}
      </section>
    </SyncProvider>
  )
}

/* --------------------------------------------------------------------------
 * Derniers messages
 * ------------------------------------------------------------------------ */

function DerniersMessages({
  messages,
  nonLus,
  maintenant,
}: {
  messages: MessageRecent[]
  nonLus: number
  maintenant: Date
}) {
  return (
    <Section
      title="Messages"
      count={nonLus > 0 ? `${formatNombre.format(nonLus)} ${pluriel(nonLus, 'non lu', 'non lus')}` : undefined}
      action={
        <Link href="/admin/messages" className="adm-more">
          Tout voir <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {messages.length === 0 ? (
        <p className="adm-meta px-[1.125rem] py-4">Aucun message reçu par le formulaire de contact.</p>
      ) : (
        <ul className="adm-rows">
          {messages.map((message) => (
            <li key={message.id} className="relative flex items-center gap-3 px-[1.125rem] py-2.5">
              <StatusDot tone={message.read ? 'neutral' : 'action'} className={cn(message.read && 'bg-transparent ring-1 ring-[color:var(--adm-line)]')} />
              <span className="min-w-0 flex-1 leading-snug">
                <Link
                  href={`/admin/messages/${message.id}`}
                  className={cn('adm-row-link block truncate hover:underline', !message.read && 'font-semibold')}
                >
                  {message.prenom} {message.nom}
                </Link>
                <span className="adm-meta block truncate">
                  {ilYa(message.createdAt, maintenant)} · {message.extrait}
                </span>
              </span>
              <StatusMark tone={message.read ? 'neutral' : 'action'} className="shrink-0">
                {message.read ? 'Lu' : 'Non lu'}
              </StatusMark>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

/**
 * Tableau de bord : l'urgent en haut et en gros, classé par échéance ; puis le
 * week-end au gymnase, l'état de la synchro et les derniers messages. La page
 * (`admin/page.tsx`) fait les lectures, cette vue ne fait qu'afficher.
 */
export function DashboardView({
  maintenant,
  titreWeekend,
  saison,
  urgences,
  domicile,
  exterieur,
  synchro,
  messages,
  messagesNonLus,
}: DashboardViewProps) {
  const total = domicile.length + exterieur
  const sousTitre = [
    total === 0
      ? 'Aucun match ce week-end'
      : `${domicile.length} ${pluriel(domicile.length, 'match', 'matchs')} à domicile · ${exterieur} à l'extérieur`,
    `saison ${saison}, celle que voit le public`,
  ].join(' · ')

  return (
    <div>
      <PageHeader title={`Week-end du ${titreWeekend}`} description={sousTitre} />

      <section aria-labelledby="titre-a-traiter" className="mb-5">
        <h2 id="titre-a-traiter" className="sr-only">
          À traiter
        </h2>
        {urgences.length === 0 ? (
          <div className="adm-panel flex items-center gap-3 px-5 py-4">
            <StatusMark tone="ok">À jour</StatusMark>
            <p className="adm-meta">
              Rien n'attend : messages, scores et brouillons apparaîtront ici dès qu'ils demanderont une action.
            </p>
          </div>
        ) : (
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
            {urgences.map((urgence, index) => (
              <CarteUrgence key={urgence.id} urgence={urgence} premiere={index === 0} />
            ))}
          </ol>
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <WeekendGymnase domicile={domicile} exterieur={exterieur} />
        <div className="flex min-w-0 flex-col gap-4">
          <Synchronisation synchro={synchro} maintenant={maintenant} />
          <DerniersMessages messages={messages} nonLus={messagesNonLus} maintenant={maintenant} />
        </div>
      </div>
    </div>
  )
}
