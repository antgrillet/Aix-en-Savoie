import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'read' | 'unread' | 'archived' | 'featured'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    published: {
      label: 'Publié',
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
    },
    draft: {
      label: 'Brouillon',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    read: {
      label: 'Lu',
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    },
    unread: {
      label: 'Non lu',
      className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    },
    archived: {
      label: 'Archivé',
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    },
    featured: {
      label: 'Vedette',
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    },
  }

  const variant = variants[status]

  return (
    <Badge className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  )
}
