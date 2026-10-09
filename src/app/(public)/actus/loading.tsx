import { container } from '@/components/site/styles'
import { cn } from '@/lib/utils'

const block = 'rounded-md bg-white/[0.06]'

export default function Loading() {
  return (
    <div className="animate-pulse" role="status">
      {/* En-tête, mêmes dimensions que PageHero */}
      <section className="border-b border-white/10 bg-neutral-950">
        <div className={cn(container, 'pb-12 pt-32 md:pb-16 md:pt-40')}>
          <div className={cn(block, 'mb-5 h-4 w-32')} />
          <div className={cn(block, 'h-12 w-3/4 max-w-xl sm:h-16 lg:h-20')} />
          <div className={cn(block, 'mt-5 h-5 w-full max-w-2xl')} />
          <div className={cn(block, 'mt-2 h-5 w-2/3 max-w-lg')} />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className={container}>
          <div className="mb-10 flex flex-wrap gap-2 border-b border-white/10 pb-6 md:mb-12">
            {[20, 16, 24, 28, 24].map((width, i) => (
              <div key={i} className="h-10 rounded-full bg-white/[0.06]" style={{ width: `${width * 4}px` }} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="aspect-[16/10] rounded-xl border border-white/10 bg-neutral-900" />
                <div className={cn(block, 'mt-4 h-3 w-24')} />
                <div className={cn(block, 'mt-3 h-5 w-5/6')} />
                <div className={cn(block, 'mt-3 h-4 w-full')} />
                <div className={cn(block, 'mt-2 h-4 w-2/3')} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <span className="sr-only">Chargement des actualités…</span>
    </div>
  )
}
