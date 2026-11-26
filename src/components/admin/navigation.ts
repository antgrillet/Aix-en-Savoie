import {
  Handshake,
  Images,
  LayoutDashboard,
  Medal,
  MessageSquare,
  Newspaper,
  Receipt,
  Settings,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type AdminSectionId =
  | 'tableau'
  | 'articles'
  | 'equipes'
  | 'matchs'
  | 'resultats'
  | 'visuels'
  | 'partenaires'
  | 'messages'
  | 'arbitrage'
  | 'parametres'

/** Couleur du compteur : orange = à traiter, rouge = bloquant, gris = à surveiller */
export type CountTone = 'action' | 'bad' | 'neutral'

export interface AdminSection {
  id: AdminSectionId
  /** Libellé complet (barre latérale, feuille « Plus », titres) */
  name: string
  /** Libellé court de la barre d'onglets du téléphone */
  tabName?: string
  href: string
  icon: LucideIcon
  /** Présent dans la barre d'onglets du téléphone ; le reste passe par « Plus » */
  tab?: boolean
  countTone?: CountTone
}

export interface AdminGroup {
  title: string
  sections: AdminSection[]
}

/** La navigation, rangée par moment d'usage : le week-end d'abord, le club en dernier. */
export const ADMIN_GROUPS: AdminGroup[] = [
  {
    title: 'Ce week-end',
    sections: [
      { id: 'tableau', name: 'Tableau de bord', tabName: 'Accueil', href: '/admin', icon: LayoutDashboard, tab: true },
      { id: 'resultats', name: 'Résultats', href: '/admin/resultats', icon: Medal, tab: true, countTone: 'action' },
      { id: 'visuels', name: 'Visuels', href: '/admin/visuels', icon: Images },
    ],
  },
  {
    title: 'Calendrier',
    sections: [
      { id: 'matchs', name: 'Matchs', href: '/admin/matchs', icon: Trophy },
      { id: 'equipes', name: 'Équipes', href: '/admin/equipes', icon: Users, countTone: 'bad' },
    ],
  },
  {
    title: 'Site public',
    sections: [
      { id: 'articles', name: 'Articles', href: '/admin/articles', icon: Newspaper, countTone: 'neutral' },
      { id: 'partenaires', name: 'Partenaires', href: '/admin/partenaires', icon: Handshake },
      { id: 'messages', name: 'Messages', href: '/admin/messages', icon: MessageSquare, tab: true, countTone: 'action' },
    ],
  },
  {
    title: 'Club',
    sections: [
      { id: 'arbitrage', name: 'Arbitrage', href: '/admin/arbitrage', icon: Receipt, countTone: 'action' },
      { id: 'parametres', name: 'Paramètres', href: '/admin/parametres', icon: Settings },
    ],
  },
]

export const ADMIN_SECTIONS: AdminSection[] = ADMIN_GROUPS.flatMap((group) => group.sections)

/** Nombre d'éléments qui attendent une action, par section */
export type AdminCounts = Partial<Record<AdminSectionId, number>>

/** La section courante, sous-pages comprises (préfixe de chemin). */
export function isCurrentSection(section: AdminSection, pathname: string): boolean {
  if (section.href === '/admin') return pathname === '/admin'
  return pathname === section.href || pathname.startsWith(`${section.href}/`)
}
