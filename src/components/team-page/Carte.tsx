import type { ReactNode } from 'react'

interface CarteProps {
  children: ReactNode
  className?: string
  /** Titre affiché en tête (h2), relié à la section pour les lecteurs d'écran. */
  titre?: string
  titreId?: string
  action?: ReactNode
}

/** Carte sombre de la page équipe. Avec un titre, elle devient une section nommée. */
export function Carte({ children, className = '', titre, titreId, action }: CarteProps) {
  const classes = `min-w-0 rounded-2xl border border-white/10 bg-zinc-900/70 backdrop-blur-sm ${className}`
  if (!titre) return <div className={classes}>{children}</div>
  return (
    <section aria-labelledby={titreId} className={`${classes} p-4 sm:p-6`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id={titreId} className="text-lg font-bold text-white sm:text-xl">
          {titre}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
