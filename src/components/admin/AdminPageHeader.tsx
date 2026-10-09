import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: React.ReactNode
  description?: React.ReactNode
  /** Boutons d'action alignés à droite */
  actions?: React.ReactNode
  /** Lien de retour (ex. vers la liste depuis un formulaire) */
  backHref?: string
  backLabel?: string
  className?: string
}

/** En-tête commun à toutes les pages de l'admin */
export function AdminPageHeader({ title, description, actions, backHref, backLabel = 'Retour', className }: AdminPageHeaderProps) {
  return (
    <header className={cn('mb-8', className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
