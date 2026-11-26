import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  /** Une phrase : ce qu'on fait sur cet écran, ou l'état qui compte */
  description?: React.ReactNode
  /** Boutons de la page. L'action principale (orange) en dernier, à droite. */
  actions?: React.ReactNode
  /** Sous-page : lien de retour vers la liste parente */
  back?: { href: string; label: string }
  className?: string
}

/**
 * En-tête de page : titre en Barlow Condensed 32 px posé sur le fond, actions
 * à droite. Un seul par écran, c'est lui qui porte le `h1`.
 */
export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-5', className)}>
      {back && (
        <Link
          href={back.href}
          className="adm-link -ml-1 mb-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-[0.875rem] font-medium md:min-h-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="adm-title">{title}</h1>
          {description && <p className="adm-meta mt-1.5 max-w-[75ch] text-[0.9375rem]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

interface SectionProps {
  title: string
  /** Compte des éléments, ou phrase courte, à droite du titre */
  count?: React.ReactNode
  /** Lien ou bouton à droite : « Tout voir → » */
  action?: React.ReactNode
  /** Sans panneau : le titre et le contenu sont posés sur le fond */
  bare?: boolean
  className?: string
  /** Classes du corps (sous l'en-tête) */
  bodyClassName?: string
  children: React.ReactNode
}

/** Panneau titré : fond blanc, en-tête à filet, contenu à filets. */
export function Section({ title, count, action, bare, className, bodyClassName, children }: SectionProps) {
  return (
    <section className={cn(!bare && 'adm-panel', className)}>
      <div className={cn(bare ? 'mb-2 flex min-h-10 flex-wrap items-center gap-x-3' : 'adm-panel-head')}>
        <h2 className="adm-h2">{title}</h2>
        {count !== undefined && count !== null && (
          <span className="adm-meta">{count}</span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
