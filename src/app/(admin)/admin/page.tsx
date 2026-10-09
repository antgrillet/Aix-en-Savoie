import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatParis } from '@/lib/match-format'
import { cn } from '@/lib/utils'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ClipboardList,
  Eye,
  Handshake,
  MessageSquare,
  Newspaper,
  Plus,
  Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

function Panel({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Voir tout
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </Card>
  )
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-sm text-muted-foreground">{children}</p>
}

export default async function AdminDashboard() {
  const now = new Date()

  const [
    articlesCount,
    articlesPublished,
    articlesDraft,
    equipesCount,
    equipesPublished,
    partenairesCount,
    messagesCount,
    matchsCount,
    matchsUpcoming,
    inscriptionsCount,
    totalViews,
    popularArticles,
    upcomingMatches,
    recentArticles,
    recentInscriptions,
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.article.count({ where: { published: false } }),
    prisma.equipe.count(),
    prisma.equipe.count({ where: { published: true } }),
    prisma.partenaire.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.match.count(),
    prisma.match.count({ where: { date: { gte: now }, termine: false } }),
    prisma.inscription.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.findMany({
      where: { published: true },
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, titre: true, views: true },
    }),
    prisma.match.findMany({
      where: { date: { gte: now }, termine: false, published: true },
      take: 5,
      orderBy: { date: 'asc' },
      select: { id: true, adversaire: true, date: true, domicile: true, equipe: { select: { nom: true } } },
    }),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, titre: true, categorie: true, createdAt: true, published: true },
    }),
    prisma.inscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, nom: true, prenom: true, createdAt: true },
    }),
  ])

  const stats = [
    {
      title: 'Articles',
      value: articlesCount,
      subtitle: `${articlesPublished} publiés · ${articlesDraft} brouillons`,
      icon: Newspaper,
      href: '/admin/articles',
    },
    {
      title: 'Équipes',
      value: equipesCount,
      subtitle: `${equipesPublished} publiées`,
      icon: Users,
      href: '/admin/equipes',
    },
    {
      title: 'Matchs',
      value: matchsCount,
      subtitle: `${matchsUpcoming} à venir`,
      icon: Calendar,
      href: '/admin/matchs',
    },
    {
      title: 'Messages non lus',
      value: messagesCount,
      subtitle: messagesCount > 0 ? 'À traiter' : 'Tout est lu',
      icon: MessageSquare,
      href: '/admin/messages',
      highlight: messagesCount > 0,
    },
  ]

  const secondaryStats = [
    { label: 'Vues des articles', value: totalViews._sum.views || 0, icon: Eye },
    { label: 'Partenaires publiés', value: partenairesCount, icon: Handshake },
    { label: 'Inscriptions bénévoles', value: inscriptionsCount, icon: ClipboardList },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble du site du club"
        actions={
          <>
            <Button variant="outline" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                Voir le site
                <ArrowUpRight />
              </a>
            </Button>
            <Button asChild>
              <Link href="/admin/articles/new">
                <Plus />
                Nouvel article
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full p-4 transition-colors group-hover:border-neutral-300 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md',
                      stat.highlight ? 'bg-primary-500 text-neutral-950' : 'bg-primary-50 text-primary-700'
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="mt-3 font-display text-3xl font-bold tabular-nums">{stat.value}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{stat.subtitle}</p>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card className="mt-3 grid divide-y sm:mt-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="flex items-center gap-3 px-5 py-3.5">
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">{stat.label}</span>
              <span className="font-display text-lg font-bold tabular-nums">{stat.value}</span>
            </div>
          )
        })}
      </Card>

      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Panel title="Prochains matchs" href="/admin/matchs">
          {upcomingMatches.length === 0 ? (
            <EmptyRow>Aucun match à venir</EmptyRow>
          ) : (
            <ul className="divide-y">
              {upcomingMatches.map((match) => (
                <li key={match.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs font-medium uppercase text-muted-foreground">
                      {formatParis(match.date, { weekday: 'short' }).replace('.', '')}
                    </p>
                    <p className="font-display text-lg font-bold leading-tight">
                      {formatParis(match.date, { day: 'numeric', month: 'short' }).replace('.', '')}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {match.equipe.nom} <span className="text-muted-foreground">vs</span> {match.adversaire}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatParis(match.date, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                      match.domicile ? 'bg-primary-50 text-primary-800' : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    {match.domicile ? 'Domicile' : 'Extérieur'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Derniers articles" href="/admin/articles">
          {recentArticles.length === 0 ? (
            <EmptyRow>Aucun article</EmptyRow>
          ) : (
            <ul className="divide-y">
              {recentArticles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{article.titre}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.categorie} · {formatParis(article.createdAt, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <StatusBadge status={article.published ? 'published' : 'draft'} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Articles les plus lus">
          {popularArticles.length === 0 ? (
            <EmptyRow>Aucun article</EmptyRow>
          ) : (
            <ol className="divide-y">
              {popularArticles.map((article, index) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <span className="w-5 shrink-0 font-display text-sm font-bold text-muted-foreground">{index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{article.titre}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground">
                      <Eye className="size-3.5" />
                      {article.views}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Dernières inscriptions bénévoles" href="/admin/inscriptions">
          {recentInscriptions.length === 0 ? (
            <EmptyRow>Aucune inscription</EmptyRow>
          ) : (
            <ul className="divide-y">
              {recentInscriptions.map((inscription) => (
                <li key={inscription.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="truncate text-sm font-medium">
                    {inscription.prenom} {inscription.nom}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatParis(inscription.createdAt, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
