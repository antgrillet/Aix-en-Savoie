import type { ReactNode } from 'react'

interface SideCardProps {
  title: string
  children: ReactNode
}

/** Carte de la colonne latérale d'un article. */
export function SideCard({ title, children }: SideCardProps) {
  return (
    <section className="rounded-[14px] border border-zinc-700/70 bg-zinc-800/50 p-5 sm:p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-white">{title}</h2>
      {children}
    </section>
  )
}
