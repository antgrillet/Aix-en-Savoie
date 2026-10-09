import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // `theme-site` active les couleurs sombres du site (voir styles.css)
    <div className="theme-site dark flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      {/* Lien d'évitement pour la navigation au clavier */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-neutral-950 focus:shadow-lg"
      >
        Aller au contenu principal
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
