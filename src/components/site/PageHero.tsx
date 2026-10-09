import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'
import { container } from './styles'

interface PageHeroProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  /** Image de fond configurable depuis l'admin (Paramètres) */
  backgroundImage?: string | null
  children?: React.ReactNode
  className?: string
}

/**
 * En-tête commun des pages internes : même hauteur, même typographie,
 * dégagé sous le header fixe.
 */
export function PageHero({ eyebrow, title, description, backgroundImage, children, className }: PageHeroProps) {
  return (
    <section className={cn('relative isolate overflow-hidden border-b border-white/10 bg-neutral-950', className)}>
      {backgroundImage ? (
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-neutral-950/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/60" />
        </div>
      ) : (
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary-500/[0.07] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-stripes" />
        </div>
      )}

      <div className={cn(container, 'pb-12 pt-32 md:pb-16 md:pt-40')}>
        {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
        <h1 className="max-w-4xl font-headline text-5xl text-white sm:text-6xl lg:text-7xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base text-neutral-300 md:text-lg">{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
