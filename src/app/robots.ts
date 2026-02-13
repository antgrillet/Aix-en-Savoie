import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/calendrier'],
      },
    ],
    sitemap: 'https://hbc-aix-en-savoie.fr/sitemap.xml',
  }
}
