import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hbc-aix-en-savoie.fr'

  const articles = await prisma.article.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const equipes = await prisma.equipe.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const partenaires = await prisma.partenaire.findMany({
    where: {
      published: true,
      slug: { not: null },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const articleUrls = articles.map((article) => ({
    url: `${baseUrl}/actus/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const equipeUrls = equipes.map((equipe) => ({
    url: `${baseUrl}/equipes/${equipe.slug}`,
    lastModified: equipe.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const partenaireUrls = partenaires
    .filter((partenaire) => Boolean(partenaire.slug))
    .map((partenaire) => ({
      url: `${baseUrl}/partenaires/${partenaire.slug}`,
      lastModified: partenaire.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
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
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...articleUrls,
    ...equipeUrls,
    ...partenaireUrls,
  ]
}
