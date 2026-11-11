import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRight, Plus } from 'lucide-react'
import type { ATraiter } from '@/components/admin/a-traiter'
import { Button } from '@/components/admin/Button'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader, Section } from '@/components/admin/PageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { StatusMark } from '@/components/admin/StatusMark'

const FUSEAU_CLUB = 'Europe/Paris'

const formatJour = new Intl.DateTimeFormat('fr-FR', {
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

const formatDateCourte = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const formatNombre = new Intl.NumberFormat('fr-FR')

function pluriel(nombre: number, singulier: string, plurielle: string) {
  return nombre > 1 ? plurielle : singulier
}

const lienSection = 'adm-link inline-flex min-h-11 items-center text-[0.8125rem] font-medium md:min-h-8'

export interface DashboardViewProps {
  aTraiter: ATraiter
  articlesCount: number
  equipesCount: number
  matchsUpcoming: number
  partenairesCount: number
  inscriptionsCount: number
  totalViews: number
  upcomingMatches: {
    id: number
    adversaire: string
    date: Date
    domicile: boolean
    equipe: { nom: string }
  }[]
  recentArticles: {
    id: number
    titre: string
    categorie: string
    createdAt: Date
    published: boolean
  }[]
  popularArticles: { id: number; titre: string; views: number }[]
  recentInscriptions: { id: number; nom: string; prenom: string; createdAt: Date }[]
}

/**
 * Tableau de bord : ce qui attend une action d'abord, puis les listes, puis
 * les totaux sur une seule bande. La page (`admin/page.tsx`) fait les lectures,
 * cette vue ne fait qu'afficher.
 */
export function DashboardView({
  aTraiter,
  articlesCount,
  equipesCount,
  matchsUpcoming,
  partenairesCount,
  inscriptionsCount,
  totalViews,
  upcomingMatches,
  recentArticles,
  popularArticles,
  recentInscriptions,
}: DashboardViewProps) {
  // Ce qui attend une action, du plus pressant au moins pressant
  const taches = [
    {
      nombre: aTraiter.messagesNonLus,
      libelle: pluriel(aTraiter.messagesNonLus, 'message non lu', 'messages non lus'),
      detail: 'Reçus par le formulaire de contact du site.',
      href: '/admin/messages',
    },
    {
      nombre: aTraiter.scoresEnAttente,
      libelle: pluriel(aTraiter.scoresEnAttente, 'score en attente', 'scores en attente'),
      detail:
        'Matchs joués ces 30 derniers jours sans résultat : relancez la synchronisation ou saisissez le score.',
      href: '/admin/resultats',
    },
    {
      nombre: aTraiter.postesAPourvoir,
      libelle: pluriel(
        aTraiter.postesAPourvoir,
        'poste de bénévole à pourvoir',
        'postes de bénévoles à pourvoir'
      ),
      detail: `Sur ${aTraiter.matchsARenforcer} ${pluriel(aTraiter.matchsARenforcer, 'match', 'matchs')} à domicile à venir.`,
      href: '/admin/inscriptions',
    },
    {
      nombre: aTraiter.brouillons,
      libelle: pluriel(aTraiter.brouillons, 'article en brouillon', 'articles en brouillon'),
      detail: 'Écrits, pas encore visibles sur le site.',
      href: '/admin/articles?statut=draft',
    },
    {
      nombre: aTraiter.equipesSansLien,
      libelle: pluriel(
        aTraiter.equipesSansLien,
        'équipe sans lien FFHANDBALL',
        'équipes sans lien FFHANDBALL'
      ),
      detail: 'Sans ce lien, leurs matchs ne se synchronisent pas.',
      href: '/admin/equipes',
    },
  ].filter((tache) => tache.nombre > 0)

  const totaux = [
    { nombre: articlesCount, libelle: pluriel(articlesCount, 'article', 'articles') },
    { nombre: equipesCount, libelle: pluriel(equipesCount, 'équipe', 'équipes') },
    { nombre: matchsUpcoming, libelle: pluriel(matchsUpcoming, 'match à venir', 'matchs à venir') },
    {
      nombre: partenairesCount,
      libelle: pluriel(partenairesCount, 'partenaire publié', 'partenaires publiés'),
    },
    {
      nombre: inscriptionsCount,
      libelle: pluriel(inscriptionsCount, 'inscription de bénévole', 'inscriptions de bénévoles'),
    },
    {
      nombre: totalViews,
      libelle: pluriel(totalViews, "vue d'article", "vues d'articles"),
    },
    // Tant qu'aucune vue n'est comptée, le chiffre et le classement n'apprennent rien
  ].filter((total) => total.libelle !== "vue d'article" || total.nombre > 0)
  const vuesComptees = totalViews > 0

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        actions={
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus aria-hidden="true" />
              Nouvel article
            </Link>
          </Button>
        }
      />

      <Section title="À traiter" count={taches.length > 0 ? taches.length : undefined}>
        {taches.length === 0 ? (
          <EmptyState title="Rien n'attend">
            <p>
              Les messages non lus, les scores manquants, les postes de bénévoles à pourvoir et les
              brouillons apparaîtront ici dès qu'ils demanderont une action.
            </p>
          </EmptyState>
        ) : (
          <ul className="adm-rows">
            {taches.map((tache) => (
              <li key={tache.href}>
                <Link href={tache.href} className="group flex min-h-[4.5rem] items-center gap-4 py-3 sm:gap-6">
                  <span className="adm-num-lg w-14 shrink-0 text-primary sm:w-16">
                    {formatNombre.format(tache.nombre)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug group-hover:underline">
                      {tache.libelle}
                    </span>
                    <span className="adm-meta block">{tache.detail}</span>
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
        <Section
          title="Prochains matchs"
          action={
            <Link href="/admin/matchs" className={lienSection}>
              Tous les matchs
            </Link>
          }
        >
          {upcomingMatches.length === 0 ? (
            <p className="adm-meta py-5">
              Aucun match publié à venir. Ils arrivent avec la synchronisation FFHANDBALL, ou
              s'ajoutent à la main depuis « Matchs ».
            </p>
          ) : (
            <ul className="adm-rows">
              {upcomingMatches.map((match) => (
                <li key={match.id}>
                  <Link href={`/admin/matchs/${match.id}`} className="group flex min-h-14 items-center gap-4 py-2">
                    <span className="w-[5.5rem] shrink-0 leading-tight">
                      <span className="block text-[0.8125rem] font-semibold">
                        {formatJour.format(match.date)}
                      </span>
                      <span className="adm-meta block">{formatHeure.format(match.date)}</span>
                    </span>
                    <span className="min-w-0 flex-1 font-medium group-hover:underline max-md:line-clamp-2 md:truncate">
                      {match.equipe.nom} – {match.adversaire}
                    </span>
                    <StatusMark tone={match.domicile ? 'fill' : 'solid'}>
                      {match.domicile ? 'Domicile' : 'Extérieur'}
                    </StatusMark>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Derniers articles"
          action={
            <Link href="/admin/articles" className={lienSection}>
              Tous les articles
            </Link>
          }
        >
          {recentArticles.length === 0 ? (
            <p className="adm-meta py-5">
              Aucun article pour l'instant. « Nouvel article », en haut de la page, crée le premier.
            </p>
          ) : (
            <ul className="adm-rows">
              {recentArticles.map((article) => (
                <li key={article.id}>
                  <Link href={`/admin/articles/${article.id}`} className="group flex min-h-14 items-center gap-4 py-2">
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block font-medium group-hover:underline max-md:line-clamp-2 md:truncate">{article.titre}</span>
                      <span className="adm-meta block truncate">
                        {article.categorie} · {formatDateCourte.format(article.createdAt)}
                      </span>
                    </span>
                    <StatusBadge status={article.published ? 'published' : 'draft'} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <dl
        aria-label="Totaux du site"
        className="mt-10 grid grid-cols-3 gap-y-4 border-y-2 border-foreground py-4 md:grid-flow-col md:auto-cols-fr md:grid-cols-none"
      >
        {totaux.map((total) => (
          <div
            key={total.libelle}
            className="flex flex-col-reverse justify-end gap-1 border-l border-border px-3 max-md:[&:nth-child(3n+1)]:border-l-0 max-md:[&:nth-child(3n+1)]:pl-0 md:px-4 md:first:border-l-0 md:first:pl-0"
          >
            <dt className="adm-micro">{total.libelle}</dt>
            <dd className="adm-num-md">{formatNombre.format(total.nombre)}</dd>
          </div>
        ))}
      </dl>

      <div
        className={cn(
          'mt-10 grid grid-cols-1 gap-x-10 gap-y-10',
          // Seule, la liste des inscriptions prend toute la largeur
          vuesComptees && 'lg:grid-cols-2'
        )}
      >
        {vuesComptees && (
          <Section title="Articles les plus lus">
            {popularArticles.length === 0 ? (
              <p className="adm-meta py-5">Aucun article publié pour l'instant.</p>
            ) : (
              <ol className="adm-rows">
                {popularArticles.map((article) => (
                  <li key={article.id}>
                    <Link href={`/admin/articles/${article.id}`} className="group flex min-h-12 items-center gap-4 py-2">
                      <span className="min-w-0 flex-1 font-medium group-hover:underline max-md:line-clamp-2 md:truncate">
                        {article.titre}
                      </span>
                      <span className="shrink-0 text-[0.8125rem]">
                        <span className="adm-num-sm">{formatNombre.format(article.views)}</span>{' '}
                        <span className="text-muted-foreground">{pluriel(article.views, 'vue', 'vues')}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        )}

        <Section
          title="Dernières inscriptions"
          action={
            <Link href="/admin/inscriptions" className={lienSection}>
              Toutes les inscriptions
            </Link>
          }
        >
          {recentInscriptions.length === 0 ? (
            <p className="adm-meta py-5">
              Aucune inscription pour l'instant. Elles arrivent par le calendrier du site.
            </p>
          ) : (
            <ul className="adm-rows">
              {recentInscriptions.map((inscription) => (
                <li key={inscription.id} className="flex min-h-12 items-center gap-4 py-2">
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {inscription.prenom} {inscription.nom}
                  </span>
                  <span className="adm-meta shrink-0">
                    {formatDateCourte.format(inscription.createdAt)} · {formatHeure.format(inscription.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
