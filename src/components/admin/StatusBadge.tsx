import { Star } from 'lucide-react'
import { StatusMark, type StatusTone } from '@/components/admin/StatusMark'

interface StatusBadgeProps {
  status: 'published' | 'draft' | 'read' | 'unread' | 'archived' | 'featured'
  className?: string
}

const STATUSES: Record<StatusBadgeProps['status'], { label: string; tone: StatusTone }> = {
  published: { label: 'Publié', tone: 'solid' },
  draft: { label: 'Brouillon', tone: 'dashed' },
  read: { label: 'Lu', tone: 'solid' },
  unread: { label: 'Non lu', tone: 'action' },
  archived: { label: 'Archivé', tone: 'solid' },
  featured: { label: 'Vedette', tone: 'fill' },
}

/**
 * Statuts courants, déjà nommés. Pour un statut propre à une section, utiliser
 * `StatusMark` directement.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, tone } = STATUSES[status]

  return (
    <StatusMark tone={tone} icon={status === 'featured' ? Star : undefined} className={className}>
      {label}
    </StatusMark>
  )
}
