import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Rendue hors du layout public : on pose nous-mêmes le thème sombre du site
export default function NotFound() {
  return (
    <div className="theme-site dark relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-neutral-950 px-4 py-16 text-center text-neutral-100">
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />

      <Link
        href="/"
        aria-label="HBC Aix-en-Savoie — accueil"
        className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <Image src="/img/home/logo.png" alt="" width={96} height={96} priority className="size-20 object-contain sm:size-24" />
      </Link>

      <p aria-hidden className="mt-8 font-headline text-[8rem] leading-[0.85] text-primary-500 sm:text-[12rem]">
        404
      </p>
      <h1 className="mt-4 font-headline text-4xl text-white sm:text-5xl">Page introuvable</h1>
      <p className="mt-4 max-w-md text-balance text-base text-neutral-400 md:text-lg">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>

      <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/" className={cn(siteButton({ size: 'lg' }), 'group')}>
          Retour à l&apos;accueil
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
        <Link href="/actus" className={siteButton({ variant: 'outline', size: 'lg' })}>
          Voir les actualités
        </Link>
      </div>
    </div>
  )
}
