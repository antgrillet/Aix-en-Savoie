import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  /** Ce que ces champs changent sur le site, en une phrase */
  description?: React.ReactNode
  /** Section facultative : mention « facultatif » après le titre */
  optional?: boolean
  /** Ancre de la section (lien direct depuis une autre page) */
  id?: string
  className?: string
  children: React.ReactNode
}

/**
 * Groupe de champs dans un panneau blanc : titre à gauche sur grand écran,
 * champs à droite sur 40 rem. Les panneaux s'empilent avec un écart régulier.
 */
export function FormSection({ title, description, optional, id, className, children }: FormSectionProps) {
  return (
    <section id={id} className={cn('adm-form-section mb-4 scroll-mt-20', className)}>
      <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div>
          <h2 className="adm-h2">
            {title}
            {optional && <span className="ml-2 text-[0.875rem] font-normal text-muted-foreground">facultatif</span>}
          </h2>
          {description && <div className="adm-meta mt-1">{description}</div>}
        </div>
        <div className="max-w-[40rem] space-y-5">{children}</div>
      </div>
    </section>
  )
}

interface SaveBarProps {
  /** Mention à gauche (dernière modification…), masquée sur téléphone faute de place */
  status?: React.ReactNode
  /** Boutons : « Annuler » puis l'action principale, qui nomme ce qu'elle fait */
  children: React.ReactNode
  className?: string
}

/**
 * Barre d'enregistrement, collée en bas de la surface de travail (au-dessus de
 * la barre d'onglets sur téléphone). À placer en dernier enfant du formulaire.
 */
export function SaveBar({ status, children, className }: SaveBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-[calc(var(--adm-tabbar)+env(safe-area-inset-bottom))] z-20 mx-[calc(var(--adm-pad-x)*-1)] mb-[calc(var(--adm-pad-b)*-1)] mt-2 flex items-center justify-end gap-3 border-t border-border bg-background px-[var(--adm-pad-x)] py-3 max-sm:[&>button:last-child]:flex-1 lg:bottom-0',
        className
      )}
    >
      {status && (
        <div className="mr-auto hidden min-w-0 items-center gap-2.5 text-[0.875rem] text-muted-foreground sm:flex">
          {status}
        </div>
      )}
      {children}
    </div>
  )
}
