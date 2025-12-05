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
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-neutral-900">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          Vue d'ensemble de votre site web
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className={`p-6 bg-gradient-to-br ${stat.gradient}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/90">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold mt-1 text-white">{stat.value}</p>
                      <p className="text-xs text-white/70 mt-1">{stat.subtitle}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews._sum.views || 0}</p>
                <p className="text-sm text-muted-foreground">Vues totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Handshake className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partenairesCount}</p>
                <p className="text-sm text-muted-foreground">Partenaires actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inscriptionsCount}</p>
                <p className="text-sm text-muted-foreground">Inscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Articles */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                Articles populaires
              </CardTitle>
              <CardDescription>Les plus consultés</CardDescription>
            </div>
            <Link href="/admin/articles" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun article</p>
              ) : (
                popularArticles.map((article, index) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <span className="font-medium truncate max-w-[200px]">{article.titre}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="w-4 h-4" />
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Prochains matchs
              </CardTitle>
              <CardDescription>À venir</CardDescription>
            </div>
            <Link href="/admin/matchs" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingMatches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun match à venir</p>
              ) : (
                upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {match.equipe.nom} vs {match.adversaire}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(match.date), 'EEEE d MMMM à HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Derniers articles
              </CardTitle>
              <CardDescription>Récemment créés</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/${article.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {article.published ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{article.titre}</p>
                      <p className="text-xs text-muted-foreground">{article.categorie}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(article.createdAt), 'dd/MM', { locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Inscriptions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Dernières inscriptions
              </CardTitle>
              <CardDescription>Nouvelles demandes</CardDescription>
            </div>
            <Link href="/admin/inscriptions" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune inscription</p>
              ) : (
                recentInscriptions.map((inscription) => (
                  <div
                    key={inscription.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <p className="font-medium">
                      {inscription.prenom} {inscription.nom}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(inscription.createdAt), 'dd/MM à HH:mm', { locale: fr })}
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
