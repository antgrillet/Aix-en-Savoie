import { cn } from '@/lib/utils'

/**
 * Squelettes de chargement : des barres claires à la place du texte, dans le
 * même panneau que la liste ou le formulaire attendu. Jamais de roue au milieu
 * du contenu.
 */

interface SkeletonLineProps {
  /** Classe de largeur Tailwind : `w-40`, `w-2/3`… */
  className?: string
}

export function SkeletonLine({ className }: SkeletonLineProps) {
  return <span aria-hidden="true" className={cn('adm-skel w-full', className)} />
}

const ROW_WIDTHS = ['w-3/5', 'w-2/5', 'w-1/2', 'w-2/3', 'w-1/3', 'w-3/5', 'w-2/5', 'w-1/2']

interface ListSkeletonProps {
  rows?: number
  /** Réserve la place d'une vignette à gauche de chaque ligne */
  media?: boolean
  className?: string
}

/** Lignes d'une liste en cours de chargement */
export function ListSkeleton({ rows = 6, media, className }: ListSkeletonProps) {
  return (
    <div role="status" className={cn('adm-panel adm-rows px-4', className)}>
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-14 items-center gap-4">
          {media && <span aria-hidden="true" className="size-10 shrink-0 rounded-md bg-muted" />}
          <div className="flex-1 space-y-2.5">
            <SkeletonLine className={ROW_WIDTHS[index % ROW_WIDTHS.length]} />
            <SkeletonLine className="w-1/4" />
          </div>
          <SkeletonLine className="hidden w-16 sm:block" />
        </div>
      ))}
    </div>
  )
}

/** Champs d'un formulaire en cours de chargement */
export function FormSkeleton({ fields = 5, className }: { fields?: number; className?: string }) {
  return (
    <div role="status" className={cn('adm-panel max-w-[60rem] space-y-6 p-6', className)}>
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-3">
          <SkeletonLine className="w-28" />
          <div aria-hidden="true" className="h-10 max-w-[40rem] rounded-lg border border-border" />
        </div>
      ))}
    </div>
  )
}

/** En-tête de page en cours de chargement */
export function PageHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="mb-5 flex h-[4.25rem] items-end justify-between pb-1">
      <div className="space-y-4">
        <SkeletonLine className="h-7 w-48" />
        <SkeletonLine className="w-72 max-w-[60vw]" />
      </div>
    </div>
  )
}

/** Page entière : à rendre depuis un `loading.tsx` */
export function PageSkeleton({ variant = 'list' }: { variant?: 'list' | 'form' }) {
  return (
    <div>
      <PageHeaderSkeleton />
      {variant === 'form' ? <FormSkeleton /> : <ListSkeleton media />}
    </div>
  )
}
