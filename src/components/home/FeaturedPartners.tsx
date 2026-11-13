import Image from 'next/image'
import Link from 'next/link'

interface PartenaireItem {
  id: number
  nom: string
  logo: string
  site?: string | null
}

interface FeaturedPartnersProps {
  partenaires: PartenaireItem[]
}

export function FeaturedPartners({ partenaires }: FeaturedPartnersProps) {
  if (!partenaires || partenaires.length === 0) {
    return null
  }

  const renderLogo = (partenaire: PartenaireItem, hidden: boolean) => {
    const card = (
      <div
        aria-hidden={hidden || undefined}
        className="flex h-20 w-44 shrink-0 items-center justify-center rounded-xl bg-white p-4 ring-1 ring-white/10"
      >
        <Image
          src={partenaire.logo}
          alt={partenaire.nom}
          width={140}
          height={56}
          className="max-h-12 w-auto max-w-full object-contain"
        />
      </div>
    )

    if (partenaire.site && !hidden) {
      return (
        <a
          key={`${partenaire.id}-link`}
          href={partenaire.site}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Site du partenaire ${partenaire.nom}`}
          className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {card}
        </a>
      )
    }

    return <div key={`${partenaire.id}-static`}>{card}</div>
  }

  return (
    <section className="border-y border-white/10 bg-zinc-950 py-14">
      <div
        aria-hidden
        className="mx-auto mb-10 flex max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8"
      >
        <span className="h-px flex-1 bg-white/10" />
        <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-400">
          Ils nous soutiennent
        </h2>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div className="group relative overflow-hidden">
        <div className="animate-marquee-30 flex w-max items-center gap-4 px-4 group-hover:[animation-play-state:paused]">
          {[
            ...partenaires.map((p) => ({ item: p, hidden: false })),
            ...partenaires.map((p) => ({ item: p, hidden: true })),
          ].map(({ item, hidden }, i) => (
            <div key={`${item.id}-${i}`} className="shrink-0">
              {renderLogo(item, hidden)}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-zinc-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-zinc-950 to-transparent" />
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/partenaires"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-[background-color,border-color,transform] duration-200 hover:border-white/40 hover:bg-white/5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
        >
          Découvrir tous nos partenaires
        </Link>
      </div>
    </section>
  )
}
