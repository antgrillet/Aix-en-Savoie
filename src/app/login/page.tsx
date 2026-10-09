import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/forms/LoginForm'
import { siteButton, siteCard } from '@/components/site/styles'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

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
    // Hors du layout public : on active nous-mêmes le thème sombre du site
    <div className="theme-site dark relative isolate flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-900/80 via-neutral-950/40 to-neutral-950" />

      <header className="mx-auto flex w-full max-w-7xl items-center px-4 pt-5 sm:px-6 lg:px-8">
        <Link href="/" className={cn(siteButton({ variant: 'link', size: 'sm' }), 'group gap-1.5')}>
          <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" />
          Retour au site
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/img/home/logo.png"
              alt="HBC Aix-en-Savoie"
              width={96}
              height={96}
              priority
              className="size-20 object-contain sm:size-24"
            />
            <p className="mt-5 font-eyebrow text-xs text-primary-400">HBC Aix-en-Savoie</p>
            <h1 className="mt-2 font-headline text-4xl text-white sm:text-5xl">Administration</h1>
            <p className="mt-3 text-sm text-neutral-400">Connectez-vous pour accéder à l&apos;espace admin.</p>
          </div>

          <div className={cn(siteCard, 'p-6 sm:p-8')}>
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} HBC Aix-en-Savoie
          </p>
        </div>
      </main>
    </div>
  )
}
