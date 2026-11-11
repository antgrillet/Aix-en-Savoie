import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  /** Une phrase : ce qu'on fait sur cet écran */
  description?: React.ReactNode
  /** Boutons de la page. L'action principale (orange) en dernier, à droite. */
  actions?: React.ReactNode
  /** Sous-page : lien de retour vers la liste parente */
  back?: { href: string; label: string }
  className?: string
}

/**
 * En-tête de page : titre en Barlow Condensed 28 px, actions à droite, trait
 * plein dessous. Un seul par écran, c'est lui qui porte le `h1`.
 */
export function PageHeader({ title, description, actions, back, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-6 border-b-2 border-foreground pb-4', className)}>
      {back && (
        <Link
          href={back.href}
          className="adm-link -ml-1 mb-2 inline-flex min-h-11 items-center gap-1.5 px-1 text-[0.8125rem] font-medium md:min-h-8"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h1 className="adm-title">{title}</h1>
          {description && <p className="adm-meta mt-1 max-w-[75ch]">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

interface SectionProps {
  title: string
  /** Compte des éléments de la section, annoncé à droite du titre */
  count?: number
  /** Lien ou bouton à droite : « Tout voir », par exemple */
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Bloc titré d'une page : titre de 18 px, filet noir dessous, contenu à filets. */
export function Section({ title, count, action, className, children }: SectionProps) {
  return (
    <section className={className}>
      <div className="flex min-h-10 items-center justify-between gap-4 border-b border-foreground pb-1.5">
        <h2 className="adm-h2 flex items-baseline gap-2">
          {title}
          {count !== undefined && <span className="adm-num-sm text-muted-foreground">{count}</span>}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
