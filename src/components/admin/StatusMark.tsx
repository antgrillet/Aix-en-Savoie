import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Contour } from '@/components/admin/Contour'

/**
 * - `solid`  : contour plein. État confirmé (publié, lu, terminé).
 * - `dashed` : contour pointillé. État provisoire (brouillon, en attente, optionnel).
 * - `action` : bloc orange. Attend une action (non lu, à compléter).
 * - `fill`   : bloc noir. Fait marquant confirmé (à la une, domicile).
 */
export type StatusTone = 'solid' | 'dashed' | 'action' | 'fill'

interface StatusMarkProps {
  tone?: StatusTone
  icon?: LucideIcon
  className?: string
  children: React.ReactNode
}

/**
 * Marque de statut. Garder le même élément monté quand l'état change (même
 * `key`, seul `tone` varie) : le passage de `dashed` à `solid` trace alors le
 * contour, le pointillé devient plein.
 */
export function StatusMark({ tone = 'solid', icon: Icon, className, children }: StatusMarkProps) {
  const traced = tone === 'solid' || tone === 'dashed'

  return (
    <span className={cn('adm-mark', className)} data-tone={tone}>
      {traced && <Contour dashed={tone === 'dashed'} />}
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  )
}
