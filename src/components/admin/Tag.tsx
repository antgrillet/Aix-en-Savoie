import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagProps {
  children: React.ReactNode
  /** Si présent, la puce porte un bouton de retrait */
  onRemove?: () => void
  /** Nom accessible du bouton de retrait : « Retirer le tag {nom} » */
  removeLabel?: string
  className?: string
}

/**
 * Étiquette neutre : mot-clé, catégorie, rôle. Bord fin, pas de couleur d'état.
 * Pour un état (publié, brouillon, non lu), utiliser `StatusMark`.
 */
export function Tag({ children, onRemove, removeLabel = 'Retirer', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background pl-2.5 text-[0.8125rem] font-medium leading-none text-foreground',
        onRemove ? 'pr-0' : 'pr-2.5',
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="relative grid size-7 place-content-center rounded-full transition-colors duration-150 ease-out before:absolute before:-inset-2 hover:bg-muted"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </span>
  )
}
