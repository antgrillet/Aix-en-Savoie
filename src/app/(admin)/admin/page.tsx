import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Newspaper, Users, Handshake, MessageSquare, Calendar, TrendingUp, Eye, Clock, ArrowUpRight, FileText, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Récupérer les statistiques détaillées
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
  ] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { published: true } }),
    prisma.article.count({ where: { published: false } }),
    prisma.equipe.count(),
    prisma.equipe.count({ where: { published: true } }),
    prisma.partenaire.count({ where: { published: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.match.count(),
    prisma.match.count({ where: { date: { gte: new Date() }, termine: false } }),
    prisma.inscription.count(),
    prisma.article.aggregate({ _sum: { views: true } }),
  ])

  const stats = [
    {
      title: 'Articles',
      value: articlesCount,
      subtitle: `${articlesPublished} publiés, ${articlesDraft} brouillons`,
      icon: Newspaper,
      gradient: 'from-primary-500 to-secondary-500',
      href: '/admin/articles',
    },
    {
      title: 'Équipes',
      value: equipesCount,
      subtitle: `${equipesPublished} publiées`,
      icon: Users,
      gradient: 'from-secondary-500 to-primary-500',
      href: '/admin/equipes',
    },
    {
      title: 'Matchs',
      value: matchsCount,
      subtitle: `${matchsUpcoming} à venir`,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/admin/matchs',
    },
    {
      title: 'Messages',
      value: messagesCount,
      subtitle: 'non lus',
      icon: MessageSquare,
      gradient: messagesCount > 0 ? 'from-red-500 to-orange-500' : 'from-green-500 to-emerald-500',
      href: '/admin/messages',
    },
  ]

  // Articles les plus vus
  const popularArticles = await prisma.article.findMany({
    where: { published: true },
    take: 5,
    orderBy: { views: 'desc' },
    select: {
      id: true,
      titre: true,
      views: true,
      slug: true,
    },
  })

  // Prochains matchs
  const upcomingMatches = await prisma.match.findMany({
    where: {
      date: { gte: new Date() },
      termine: false,
      published: true,
    },
    take: 5,
    orderBy: { date: 'asc' },
    select: {
      id: true,
      adversaire: true,
      date: true,
      domicile: true,
      equipe: {
        select: { nom: true },
      },
    },
  })

  // Derniers articles
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      titre: true,
      categorie: true,
      createdAt: true,
      published: true,
    },
  })

  // Dernières inscriptions
  const recentInscriptions = await prisma.inscription.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nom: true,
      prenom: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-neutral-900">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mt-1 sm:mt-2">
          Vue d'ensemble de votre site web
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
                <CardContent className={`p-3 sm:p-6 bg-gradient-to-br ${stat.gradient}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-white/90 truncate">
                        {stat.title}
                      </p>
                      <p className="text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 text-white">{stat.value}</p>
                      <p className="text-[10px] sm:text-xs text-white/70 mt-0.5 sm:mt-1 truncate">{stat.subtitle}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-lg w-fit">
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg mb-2 sm:mb-0">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{totalViews._sum.views || 0}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Vues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg mb-2 sm:mb-0">
                <Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{partenairesCount}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Partenaires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:gap-4 text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg mb-2 sm:mb-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold">{inscriptionsCount}</p>
                <p className="text-[10px] sm:text-sm text-muted-foreground">Inscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Popular Articles */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                <span className="hidden sm:inline">Articles populaires</span>
                <span className="sm:hidden">Populaires</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Les plus consultés</CardDescription>
            </div>
            <Link href="/admin/articles" className="text-xs sm:text-sm text-primary-500 hover:underline flex items-center gap-1">
              <span className="hidden sm:inline">Voir tout</span> <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {popularArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
              ) : (
                popularArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-sm sm:text-lg font-bold text-muted-foreground w-5 sm:w-6 flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm sm:text-base truncate">{article.titre}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      {article.views}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="hidden sm:inline">Prochains matchs</span>
                <span className="sm:hidden">Matchs</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">À venir</CardDescription>
            </div>
            <Link href="/admin/matchs" className="text-xs sm:text-sm text-primary-500 hover:underline flex items-center gap-1">
              <span className="hidden sm:inline">Voir tout</span> <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {upcomingMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun match à venir</p>
              ) : (
                upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {match.equipe.nom} vs {match.adversaire}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {format(new Date(match.date), 'EEE d MMM HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full flex-shrink-0 ${
                      match.domicile
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {match.domicile ? 'Dom' : 'Ext'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <span className="hidden sm:inline">Derniers articles</span>
                <span className="sm:hidden">Récents</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Récemment créés</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {article.published ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{article.titre}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{article.categorie}</p>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                    {format(new Date(article.createdAt), 'dd/MM', { locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inscriptions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span className="hidden sm:inline">Dernières inscriptions</span>
                <span className="sm:hidden">Inscriptions</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Nouvelles demandes</CardDescription>
            </div>
            <Link href="/admin/inscriptions" className="text-xs sm:text-sm text-primary-500 hover:underline flex items-center gap-1">
              <span className="hidden sm:inline">Voir tout</span> <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              {recentInscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune inscription</p>
              ) : (
                recentInscriptions.map((inscription) => (
                  <div
                    key={inscription.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg gap-2"
                  >
                    <p className="font-medium text-sm sm:text-base truncate">
                      {inscription.prenom} {inscription.nom}
                    </p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                      {format(new Date(inscription.createdAt), 'dd/MM HH:mm', { locale: fr })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
