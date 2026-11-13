'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

interface StatItem {
  value: number
  suffix: string
  label: string
}

function CountUp({ value, active }: { value: number; active: boolean }) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!active || reduceMotion) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1200, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * value))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, value, reduceMotion])

  if (reduceMotion) {
    return <span className="tabular-nums">{value}</span>
  }

  return <span className="tabular-nums">{display}</span>
}

export function HomeStats({ stats }: { stats: StatItem[] }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="border-y border-white/10 bg-zinc-950">
      <h2 className="sr-only">Le club en chiffres</h2>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-zinc-950 px-6 py-10 transition-colors duration-300 hover:bg-zinc-900/60 md:px-10 md:py-12"
          >
            {/* Tiret orange qui s'étire au survol */}
            <span
              aria-hidden
              className="absolute left-6 top-7 h-0.5 w-8 bg-primary-500/70 transition-[width] duration-300 group-hover:w-14 md:left-10 md:top-9"
            />
            <p className="mt-4 font-display text-4xl font-black text-white md:text-5xl lg:text-6xl">
              <CountUp value={stat.value} active={inView} />
              <span className="text-primary-500">{stat.suffix}</span>
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
