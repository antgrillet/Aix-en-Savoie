import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

/** Petit libellé orange précédé d'un trait, au-dessus des titres */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn('flex items-center gap-3 font-eyebrow text-xs text-primary-400 sm:text-sm', className)}>
      <span aria-hidden className="h-0.5 w-8 bg-primary-500" />
      {children}
    </p>
  )
}
