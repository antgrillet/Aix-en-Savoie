import { prisma } from '@/lib/prisma'
import { getATraiter } from '@/components/admin/a-traiter'
import { DashboardView } from '@/components/admin/DashboardView'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const maintenant = new Date()

  const [
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
  ] = await Promise.all([
    getATraiter(),
    prisma.article.count(),
    prisma.equipe.count(),
    prisma.match.count({ where: { date: { gte: maintenant }, termine: false } }),
    prisma.partenaire.count({ where: { published: true } }),
    prisma.inscription.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.match.findMany({
      where: { date: { gte: maintenant }, termine: false, published: true },
      take: 5,
      orderBy: { date: 'asc' },
      select: {
        id: true,
        adversaire: true,
        date: true,
        domicile: true,
        equipe: { select: { nom: true } },
      },
    }),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, titre: true, categorie: true, createdAt: true, published: true },
    }),
    prisma.article.findMany({
      where: { published: true },
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, titre: true, views: true },
    }),
    prisma.inscription.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, nom: true, prenom: true, createdAt: true },
    }),
  ])

  return (
    <DashboardView
      aTraiter={aTraiter}
      articlesCount={articlesCount}
      equipesCount={equipesCount}
      matchsUpcoming={matchsUpcoming}
      partenairesCount={partenairesCount}
      inscriptionsCount={inscriptionsCount}
      totalViews={totalViews._sum.views ?? 0}
      upcomingMatches={upcomingMatches}
      recentArticles={recentArticles}
      popularArticles={popularArticles}
      recentInscriptions={recentInscriptions}
    />
  )
}
