import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  /** Ce que ces champs changent sur le site, en une phrase */
  description?: React.ReactNode
  /** Section facultative : son filet est en pointillé */
  optional?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Groupe de champs. Trait plein au-dessus (pointillé si la section est
 * facultative), titre à gauche sur grand écran, champs à droite sur 40 rem.
 * La première section d'un formulaire n'a pas de trait : celui de l'en-tête
 * de page en tient lieu.
 */
export function FormSection({ title, description, optional, className, children }: FormSectionProps) {
  return (
    <section className={cn('adm-form-section pb-8', className)}>
      <span aria-hidden="true" className={cn('adm-rule text-foreground', optional && 'adm-rule--dashed')} />
      <div className="adm-form-section__body grid gap-x-10 gap-y-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div>
          <h2 className="adm-h2">
            {title}
            {optional && <span className="ml-2 text-[0.8125rem] font-normal text-muted-foreground">facultatif</span>}
          </h2>
          {description && <p className="adm-meta mt-1">{description}</p>}
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
        'sticky bottom-[calc(var(--adm-tabbar)+env(safe-area-inset-bottom))] z-20 mx-[calc(var(--adm-pad-x)*-1)] mb-[calc(var(--adm-pad-b)*-1)] flex items-center justify-end gap-3 border-t-2 border-foreground bg-background px-[var(--adm-pad-x)] py-3 max-sm:[&>button:last-child]:flex-1 lg:bottom-0',
        className
      )}
    >
      {status && (
        <div className="mr-auto hidden min-w-0 items-center gap-2.5 text-[0.8125rem] text-muted-foreground sm:flex">
          {status}
        </div>
      )}
      {children}
    </div>
  )
}
