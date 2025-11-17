import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper, Users, Handshake, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  // Récupérer les statistiques
  const [articlesCount, equipesCount, partenairesCount, messagesCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.equipe.count(),
      prisma.partenaire.count(),
      prisma.contactMessage.count({ where: { read: false } }),
    ])

  const stats = [
    {
      title: 'Articles',
      value: articlesCount,
      icon: Newspaper,
      gradient: 'from-primary-500 to-secondary-500',
    },
    {
      title: 'Équipes',
      value: equipesCount,
      icon: Users,
      gradient: 'from-secondary-500 to-primary-500',
    },
    {
      title: 'Partenaires',
      value: partenairesCount,
      icon: Handshake,
      gradient: 'from-primary-600 to-secondary-600',
    },
    {
      title: 'Messages non lus',
      value: messagesCount,
      icon: MessageSquare,
      gradient: 'from-secondary-600 to-primary-600',
    },
  ]

  // Récupérer les derniers articles
  const recentArticles = await prisma.article.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    select: {
      id: true,
      titre: true,
      categorie: true,
      date: true,
      published: true,
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
            <Card key={stat.title} className="overflow-hidden border-0 shadow-lg">
              <CardContent className={`p-6 bg-gradient-to-br ${stat.gradient}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2 text-white">{stat.value}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Articles */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white via-white to-orange-50">
        <CardHeader>
          <CardTitle className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
            Derniers articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-orange-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div>
                  <h3 className="font-semibold">{article.titre}</h3>
                  <p className="text-sm text-neutral-600">
                    {article.categorie} •{' '}
                    {new Date(article.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      article.published
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                        : 'bg-gradient-to-r from-neutral-400 to-neutral-500 text-white'
                    }`}
                  >
                    {article.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
