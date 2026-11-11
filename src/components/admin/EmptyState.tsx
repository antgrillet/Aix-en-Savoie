import { cn } from '@/lib/utils'

interface EmptyStateProps {
  /** Ce qui manque : « Aucun article pour l'instant » */
  title: string
  /** Ce qu'il faut faire pour que la liste se remplisse */
  children?: React.ReactNode
  /** Bouton ou lien qui lance cette action */
  action?: React.ReactNode
  className?: string
}

/**
 * État vide. L'arc de zone (trait plein des 6 m, pointillé des 9 m) part du
 * coin du bloc : même géométrie que la coque et la page de connexion.
 */
export function EmptyState({ title, children, action, className }: EmptyStateProps) {
  return (
    <div className={cn('relative min-h-44 px-0 pb-8 pt-32 sm:min-h-48 sm:pl-44 sm:pt-10', className)}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 128 128"
        className="absolute left-0 top-0 size-28 text-foreground sm:size-36"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M80 0A80 80 0 0 1 0 80" vectorEffect="non-scaling-stroke" />
        <path d="M120 0A120 120 0 0 1 0 120" strokeDasharray="6 6" vectorEffect="non-scaling-stroke" />
      </svg>
      <h3 className="adm-h2">{title}</h3>
      {children && <div className="adm-meta mt-1.5 max-w-[60ch] text-[0.9375rem]">{children}</div>}
      {action && <div className="mt-4 flex flex-wrap gap-2">{action}</div>}
    </div>
  )
}
