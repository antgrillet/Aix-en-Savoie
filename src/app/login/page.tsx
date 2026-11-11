import Image from 'next/image'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/LoginForm'
import { AdminTheme } from '@/components/admin/AdminTheme'
import { CourtTrace } from '@/components/admin/CourtTrace'
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
    <>
      <AdminTheme />
      <main
        data-admin="login"
        className="adm-on-ink grid min-h-dvh bg-foreground lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]"
      >
        {/* Téléphone : le haut du terrain en bandeau */}
        <div className="mx-auto w-full max-w-xl px-4 pt-4 lg:hidden">
          <CourtTrace fit="slice" className="aspect-[220/112] w-full" />
        </div>

        <div className="flex flex-col justify-center px-6 pb-10 pt-6 sm:px-12 lg:px-16 lg:py-12">
          <div className="mx-auto w-full max-w-sm lg:mx-0">
            <Image
              src="/img/home/logo.png"
              alt="HBC Aix-en-Savoie"
              width={72}
              height={72}
              priority
              className="size-[4.5rem]"
            />
            <h1 className="adm-title mt-6">Administration du club</h1>
            <p className="adm-meta mt-1.5 text-[0.9375rem]">
              Connectez-vous pour tenir le site : articles, équipes, matchs, messages.
            </p>

            <LoginForm />

            <p className="adm-meta mt-10">
              <Link href="/" className="adm-link inline-flex min-h-11 items-center">
                Revenir au site du club
              </Link>
            </p>
          </div>
        </div>

        {/* Grand écran : le demi-terrain entier */}
        <div className="hidden p-12 lg:block">
          <CourtTrace className="size-full" />
        </div>
      </main>
    </>
  )
}
