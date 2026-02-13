import { absoluteUrl, SITE_URL } from '@/lib/seo'

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'HBC Aix-en-Savoie',
    description: 'Club de handball d\'Aix-en-Savoie',
    url: SITE_URL,
    logo: absoluteUrl('/img/logo_white.png'),
    image: absoluteUrl('/img/logo_white.png'),
    sport: 'Handball',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '7 rue des Prés Riants',
      postalCode: '73100',
      addressLocality: 'Aix-les-Bains',
      addressRegion: 'Savoie',
      addressCountry: 'FR',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Savoie',
    },
    telephone: '+33 4 79 88 45 50',
    email: 'contact@hbcaixensavoie.fr',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        telephone: '+33 4 79 88 45 50',
        email: 'contact@hbcaixensavoie.fr',
        areaServed: 'FR',
        availableLanguage: ['fr'],
      },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '12:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/hbcaixensavoie',
      'https://www.instagram.com/hbcaixensavoie',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  dateModified,
  slug,
}: {
  title: string
  description: string
  image: string
  datePublished: Date
  dateModified?: Date
  slug: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: absoluteUrl(image),
    datePublished: datePublished.toISOString(),
    dateModified: dateModified ? dateModified.toISOString() : undefined,
    author: {
      '@type': 'Organization',
      name: 'HBC Aix-en-Savoie',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HBC Aix-en-Savoie',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/img/logo_white.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/actus/${slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
