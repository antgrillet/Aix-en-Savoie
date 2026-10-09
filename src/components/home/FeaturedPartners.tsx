import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/site/SectionHeader'
import { container, siteButton } from '@/components/site/styles'
import { normalizeImagePath, cn } from '@/lib/utils'

interface Partenaire {
  id: number
  nom: string
  logo: string
  site?: string | null
  partenaire_majeur: boolean
}

interface FeaturedPartnersProps {
  partenaires: Partenaire[]
}

const tileClass =
  'group flex h-28 items-center justify-center rounded-xl bg-white p-5 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950'

export function FeaturedPartners({ partenaires }: FeaturedPartnersProps) {
  if (!partenaires || partenaires.length === 0) {
    return null
  }

  return (
    <section className="bg-neutral-950 py-20 md:py-28">
      <div className={container}>
        <SectionHeader
          eyebrow="Partenaires"
          title="Ils nous soutiennent"
          description="Ils croient en notre projet et nous accompagnent au quotidien. Un grand merci pour leur soutien !"
          action={
            <Link href="/partenaires" className={cn(siteButton({ variant: 'outline' }), 'group')}>
              Tous nos partenaires
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {partenaires.map((partenaire) => {
            const logo = (
              <div className="relative size-full">
                <Image
                  src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                  alt={partenaire.nom}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                />
              </div>
            )

            return (
              <li key={partenaire.id}>
                {partenaire.site ? (
                  <a
                    href={partenaire.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={partenaire.nom}
                    className={tileClass}
                  >
                    {logo}
                  </a>
                ) : (
                  <div className={tileClass}>{logo}</div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
