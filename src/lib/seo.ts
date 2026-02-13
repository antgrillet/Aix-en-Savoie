import type { Metadata } from 'next'

export const SITE_URL = 'https://hbc-aix-en-savoie.fr'
export const SITE_NAME = 'HBC Aix-en-Savoie'
export const DEFAULT_DESCRIPTION =
  "Club de handball d'Aix-en-Savoie - Actualités, équipes, formations et événements"
export const DEFAULT_OG_IMAGE = '/img/logo_white.png'

type BuildMetadataOptions = {
  title?: string
  description?: string
  path?: string
  image?: string | null
  noindex?: boolean
  nofollow?: boolean
  ogType?: 'website' | 'article'
}

export function absoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return new URL(path, SITE_URL).toString()
}

export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  noindex = false,
  nofollow = false,
  ogType = 'website',
}: BuildMetadataOptions): Metadata {
  const resolvedTitle = title ?? SITE_NAME
  const resolvedDescription = description ?? DEFAULT_DESCRIPTION
  const resolvedImage = image ?? DEFAULT_OG_IMAGE
  const canonical = path

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      type: ogType,
      url: absoluteUrl(canonical),
      siteName: SITE_NAME,
      locale: 'fr_FR',
      images: resolvedImage
        ? [
            {
              url: absoluteUrl(resolvedImage),
              alt: resolvedTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description: resolvedDescription,
      images: resolvedImage ? [absoluteUrl(resolvedImage)] : undefined,
    },
    robots: noindex
      ? {
          index: false,
          follow: !nofollow,
          googleBot: {
            index: false,
            follow: !nofollow,
          },
        }
      : undefined,
  }
}

export function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function excerptFromHtml(input: string, maxLength = 160) {
  const cleaned = stripHtml(input)
  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength - 1).trim()}…`
}
