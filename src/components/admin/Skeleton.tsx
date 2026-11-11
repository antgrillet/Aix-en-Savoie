import { cn } from '@/lib/utils'

/**
 * Squelettes de chargement. Ce qui charge est provisoire : des lignes en
 * pointillé à la place du texte, jamais de bloc gris ni de roue au milieu
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
    <div role="status" className={className}>
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex h-14 items-center gap-4 border-b border-border">
          {media && <span aria-hidden="true" className="size-10 shrink-0 rounded-[2px] border border-border" />}
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
    <div role="status" className={cn('max-w-[40rem] space-y-6', className)}>
      <span className="sr-only">Chargement…</span>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-3">
          <SkeletonLine className="w-28" />
          <div aria-hidden="true" className="h-10 rounded-[3px] border border-border" />
        </div>
      ))}
    </div>
  )
}

/** En-tête de page en cours de chargement */
export function PageHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="mb-6 flex h-[4.25rem] items-end justify-between border-b-2 border-foreground pb-5">
      <div className="space-y-4">
        <SkeletonLine className="w-48" />
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
