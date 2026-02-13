import { LoginForm } from '@/components/forms/LoginForm'
import Image from 'next/image'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'Connexion',
  description: "Connexion à l'espace d'administration du HBC Aix-en-Savoie.",
  path: '/login',
  noindex: true,
  nofollow: true,
})

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/img/hbc-logo.webp"
              alt="HBC Aix-en-Savoie"
              width={80}
              height={80}
              className="mx-auto rounded-full mb-4"
            />
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              Administration
            </h1>
            <p className="text-neutral-600 mt-2">
              Connectez-vous pour accéder à l'espace admin
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>

        <p className="text-center text-white text-sm mt-6">
          © {new Date().getFullYear()} HBC Aix-en-Savoie
        </p>
      </div>
    </div>
  )
}
