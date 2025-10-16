import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hbc-aix-en-savoie.fr'

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: {
      slug: true,
      date: true,
    },
  })

  const equipes = await prisma.equipe.findMany({
    select: {
      slug: true,
    },
  })

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/actus/${article.slug}`,
    lastModified: article.date,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const equipeUrls = equipes.map((equipe) => ({
    url: `${baseUrl}/equipes/${equipe.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/actus`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/equipes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partenaires`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...articleUrls,
    ...equipeUrls,
  ]
}
