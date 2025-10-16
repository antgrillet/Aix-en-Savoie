export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'HBC Aix-en-Savoie',
    description: 'Club de handball d\'Aix-en-Savoie',
    url: 'https://hbc-aix-en-savoie.fr',
    logo: 'https://hbc-aix-en-savoie.fr/img/logo_white.png',
    image: 'https://hbc-aix-en-savoie.fr/img/logo_white.png',
    sport: 'Handball',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Aix-les-Bains',
      addressRegion: 'Savoie',
      addressCountry: 'FR',
    },
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
  slug,
}: {
  title: string
  description: string
  image: string
  datePublished: Date
  slug: string
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: description,
    image: `https://hbc-aix-en-savoie.fr${image}`,
    datePublished: datePublished.toISOString(),
    author: {
      '@type': 'Organization',
      name: 'HBC Aix-en-Savoie',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HBC Aix-en-Savoie',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hbc-aix-en-savoie.fr/img/logo_white.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://hbc-aix-en-savoie.fr/actus/${slug}`,
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
      item: `https://hbc-aix-en-savoie.fr${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
