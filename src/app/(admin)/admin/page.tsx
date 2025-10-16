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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Équipes',
      value: equipesCount,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Partenaires',
      value: partenairesCount,
      icon: Handshake,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Messages non lus',
      value: messagesCount,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
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
                        ? 'bg-green-100 text-green-700'
                        : 'bg-neutral-200 text-neutral-700'
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
