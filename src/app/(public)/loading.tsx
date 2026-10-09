import { container } from '@/components/site/styles'
import { cn } from '@/lib/utils'

const block = 'rounded-md bg-white/[0.06]'

/** Squelette générique des pages publiques : en-tête façon PageHero puis contenu */
export default function Loading() {
  return (
    <div className="animate-pulse" role="status">
      <section className="border-b border-white/10 bg-neutral-950 bg-stripes">
        <div className={cn(container, 'pb-12 pt-32 md:pb-16 md:pt-40')}>
          <div className={cn(block, 'mb-5 h-4 w-32')} />
          <div className={cn(block, 'h-12 w-3/4 max-w-xl sm:h-16 lg:h-20')} />
          <div className={cn(block, 'mt-5 h-5 w-full max-w-2xl')} />
          <div className={cn(block, 'mt-2 h-5 w-2/3 max-w-lg')} />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className={cn(container, 'grid gap-6 md:grid-cols-2 lg:grid-cols-3')}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-neutral-900 p-6">
              <div className={cn(block, 'h-40 rounded-lg')} />
              <div className={cn(block, 'mt-6 h-5 w-2/3')} />
              <div className={cn(block, 'mt-3 h-4 w-full')} />
              <div className={cn(block, 'mt-2 h-4 w-5/6')} />
            </div>
          ))}
        </div>
      </section>

      <span className="sr-only">Chargement de la page…</span>
    </div>
  )
}
