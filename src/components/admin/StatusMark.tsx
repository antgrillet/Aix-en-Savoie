import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Couleur d'état. Toujours avec un mot : la couleur seule ne dit rien à qui
 * ne la distingue pas.
 *
 * - `ok`      : vert. Fait (publié, victoire, complet, défini).
 * - `bad`     : rouge. Bloquant (défaite, urgent, erreur).
 * - `action`  : orange du club. À traiter (non lu, score à saisir, incomplet).
 * - `warn`    : ambre. À surveiller (synchro ancienne, avertissement).
 * - `neutral` : gris. Sans enjeu (brouillon, à venir, extérieur, archivé).
 * - `ink`     : noir du logo. Fait marquant (domicile, à la une).
 */
export type StatusTone = 'ok' | 'bad' | 'action' | 'warn' | 'neutral' | 'ink'

interface StatusMarkProps {
  tone?: StatusTone
  icon?: LucideIcon
  className?: string
  children: React.ReactNode
}

/** Pastille d'état : fond teinté, texte de la même couleur, coins ronds. */
export function StatusMark({ tone = 'neutral', icon: Icon, className, children }: StatusMarkProps) {
  return (
    <span className={cn('adm-mark', className)} data-tone={tone}>
      {Icon && <Icon aria-hidden="true" />}
      {children}
    </span>
  )
}

/** Point d'état, à côté d'un texte qui dit l'état */
export function StatusDot({ tone = 'neutral', className }: { tone?: StatusTone; className?: string }) {
  return <span aria-hidden="true" className={cn('adm-dot', className)} data-tone={tone} />
}
