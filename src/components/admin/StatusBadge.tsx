import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'read' | 'unread' | 'archived' | 'featured'
  className?: string
}

const variants = {
  published: { label: 'Publié', dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  draft: { label: 'Brouillon', dot: 'bg-neutral-400', className: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20' },
  read: { label: 'Lu', dot: 'bg-neutral-400', className: 'bg-neutral-100 text-neutral-600 ring-neutral-500/20' },
  unread: { label: 'Non lu', dot: 'bg-primary-500', className: 'bg-primary-50 text-primary-800 ring-primary-600/25' },
  archived: { label: 'Archivé', dot: 'bg-neutral-400', className: 'bg-neutral-100 text-neutral-500 ring-neutral-500/20' },
  featured: { label: 'Vedette', dot: 'bg-primary-500', className: 'bg-primary-50 text-primary-800 ring-primary-600/25' },
}

/** Pastille de statut sobre (point coloré + libellé) */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = variants[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variant.className,
        className
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', variant.dot)} />
      {variant.label}
    </span>
  )
}
