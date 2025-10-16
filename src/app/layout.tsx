import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from '@/components/providers/Toaster'
import '../styles.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HBC Aix-en-Savoie - Handball Club',
    template: '%s | HBC Aix-en-Savoie',
  },
  description: 'Club de handball d\'Aix-en-Savoie - Actualités, équipes, formations et événements',
  keywords: ['handball', 'aix-en-savoie', 'sport', 'club', 'formation', 'équipes', 'N2F', 'handball savoie'],
  authors: [{ name: 'HBC Aix-en-Savoie' }],
  creator: 'HBC Aix-en-Savoie',
  publisher: 'HBC Aix-en-Savoie',
  metadataBase: new URL('https://hbc-aix-en-savoie.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'HBC Aix-en-Savoie - Handball Club',
    description: 'Club de handball d\'Aix-en-Savoie - Actualités, équipes, formations et événements',
    type: 'website',
    url: 'https://hbc-aix-en-savoie.fr',
    siteName: 'HBC Aix-en-Savoie',
    locale: 'fr_FR',
    images: [
      {
        url: '/img/logo_white.png',
        width: 1200,
        height: 630,
        alt: 'HBC Aix-en-Savoie - Logo du club',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HBC Aix-en-Savoie - Handball Club',
    description: 'Club de handball d\'Aix-en-Savoie - Actualités, équipes, formations et événements',
    images: ['/img/logo_white.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
