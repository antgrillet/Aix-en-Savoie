'use client'

import { useSyncExternalStore } from 'react'

// Sentinelle côté serveur / premier rendu : chiffres « -- » avant montage client
const NOT_MOUNTED = -1

function subscribe(onStoreChange: () => void) {
  const id = setInterval(onStoreChange, 1000)
  return () => clearInterval(id)
}

const pad = (n: number) => String(n).padStart(2, '0')

export function NextMatchCountdown({ isoDate }: { isoDate: string }) {
  const targetMs = new Date(isoDate).getTime()

  // Secondes restantes, quantifiées à la seconde pour rester stables entre deux ticks
  const secondsLeft = useSyncExternalStore(
    subscribe,
    () => Math.floor(Math.max(0, targetMs - Date.now()) / 1000),
    () => NOT_MOUNTED
  )

  const mounted = secondsLeft !== NOT_MOUNTED
  const started = mounted && secondsLeft <= 0

  const cells = [
    { value: mounted ? Math.floor(secondsLeft / 86400) : null, label: 'Jours' },
    { value: mounted ? Math.floor((secondsLeft % 86400) / 3600) : null, label: 'Heures' },
    { value: mounted ? Math.floor((secondsLeft % 3600) / 60) : null, label: 'Min' },
    { value: mounted ? secondsLeft % 60 : null, label: 'Sec' },
  ]

  return (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
        Compte à rebours
      </p>
      <div className="grid grid-cols-4 divide-x divide-white/10 rounded-2xl border border-white/10 bg-black/30">
        {cells.map((cell) => (
          <div key={cell.label} className="px-1 py-4 text-center md:py-5">
            <p className="font-display text-2xl font-black tabular-nums text-white md:text-3xl">
              {cell.value === null ? '––' : pad(cell.value)}
            </p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
              {cell.label}
            </p>
          </div>
        ))}
      </div>
      {started && (
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">
          Match en cours — allez les bleus !
        </p>
      )}
    </div>
  )
}
