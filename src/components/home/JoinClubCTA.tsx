import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { container, siteButton } from '@/components/site/styles'
import { cn } from '@/lib/utils'

interface CTALink {
  href: string
  label: string
}

interface JoinClubCTAProps {
  title?: string
  description?: string
  primary?: CTALink
  /** Lien secondaire ; `null` pour n'afficher que le bouton principal */
  secondary?: CTALink | null
}

/** Bandeau orange d'appel à l'action, réutilisé en bas de plusieurs pages */
export function JoinClubCTA({
  title = 'Envie de rejoindre le club ?',
  description = "Du Baby Hand aux seniors, nous accueillons de nouveaux joueurs toute l'année. Parents, joueurs ou futurs bénévoles : dites-nous ce qui vous intéresse, nous vous recontactons rapidement.",
  primary = { href: '/contact?sujet=inscription', label: 'Demander une inscription' },
  secondary = { href: '/equipes', label: 'Voir les catégories' },
}: JoinClubCTAProps) {
  return (
    <section className="relative isolate overflow-hidden bg-primary-500 text-neutral-950">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(-55deg,rgb(0_0_0/0.06)_0_2px,transparent_2px_22px)]"
      />
      <div className={cn(container, 'flex flex-col gap-10 py-16 md:py-20 lg:flex-row lg:items-center lg:justify-between')}>
        <div className="max-w-2xl">
          <h2 className="font-headline text-5xl sm:text-6xl">{title}</h2>
          <p className="mt-4 text-lg text-neutral-950/80">{description}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href={primary.href} className={cn(siteButton({ variant: 'dark', size: 'lg' }), 'group')}>
            {primary.label}
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
          {secondary && (
            <Link href={secondary.href} className={siteButton({ variant: 'darkOutline', size: 'lg' })}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
