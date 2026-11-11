import { cn } from '@/lib/utils'

interface ContourProps {
  /** Pointillé = provisoire. Sans cette prop, le trait est plein = confirmé. */
  dashed?: boolean
  className?: string
}

/**
 * Trace le contour du bloc parent (qui doit être en `relative`). Quand `dashed`
 * passe de vrai à faux sur le même élément, les tirets se referment en trait
 * plein en 180 ms : c'est la signature de l'admin.
 */
export function Contour({ dashed, className }: ContourProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn('adm-contour', className)}
      data-dashed={dashed ? '' : undefined}
    >
      <rect width="100%" height="100%" rx="2" />
    </svg>
  )
}
