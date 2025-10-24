import Link from 'next/link'
import { Home } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-9xl font-display font-bold text-primary-500">
          404
        </h1>
        <h2 className="text-3xl font-display font-bold text-neutral-900 mt-4 mb-2">
          Page non trouvée
        </h2>
        <p className="text-neutral-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-colors"
        >
          <Home className="w-5 h-5 mr-2" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
