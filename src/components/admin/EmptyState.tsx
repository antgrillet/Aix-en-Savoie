import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Ce qui manque : « Aucun article pour l'instant » */
  title: string
  /** Ce qu'il faut faire pour que la liste se remplisse */
  children?: React.ReactNode
  /** Bouton ou lien qui lance cette action */
  action?: React.ReactNode
  /** Posé dans un panneau existant : sans bord ni fond propres */
  inset?: boolean
  className?: string
}

/** État vide : ce qui manque, ce qu'il faut faire, le bouton qui le fait. */
export function EmptyState({ title, children, action, inset, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'px-5 py-8 text-center sm:px-8 sm:py-10',
        !inset && 'adm-panel',
        className
      )}
    >
      <h3 className="adm-h2">{title}</h3>
      {children && <div className="adm-meta mx-auto mt-1.5 max-w-[60ch] text-[0.9375rem]">{children}</div>}
      {action && <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
