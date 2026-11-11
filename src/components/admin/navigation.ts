import {
  ClipboardList,
  Handshake,
  LayoutDashboard,
  Medal,
  MessageSquare,
  Newspaper,
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
  | 'inscriptions'
  | 'partenaires'
  | 'messages'
  | 'parametres'

export interface AdminSection {
  id: AdminSectionId
  /** Libellé complet (rail, feuille « Plus », titres) */
  name: string
  /** Libellé court de la barre d'onglets du téléphone */
  tabName?: string
  href: string
  icon: LucideIcon
  /** Présent dans la barre d'onglets du téléphone ; le reste passe par « Plus » */
  tab?: boolean
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'tableau', name: 'Tableau de bord', tabName: 'Accueil', href: '/admin', icon: LayoutDashboard, tab: true },
  { id: 'articles', name: 'Articles', href: '/admin/articles', icon: Newspaper, tab: true },
  { id: 'equipes', name: 'Équipes', href: '/admin/equipes', icon: Users },
  { id: 'matchs', name: 'Matchs', href: '/admin/matchs', icon: Trophy, tab: true },
  { id: 'resultats', name: 'Résultats', href: '/admin/resultats', icon: Medal },
  { id: 'inscriptions', name: 'Inscriptions', href: '/admin/inscriptions', icon: ClipboardList },
  { id: 'partenaires', name: 'Partenaires', href: '/admin/partenaires', icon: Handshake },
  { id: 'messages', name: 'Messages', href: '/admin/messages', icon: MessageSquare, tab: true },
  { id: 'parametres', name: 'Paramètres', href: '/admin/parametres', icon: Settings },
]

/** Nombre d'éléments qui attendent une action, par section */
export type AdminCounts = Partial<Record<AdminSectionId, number>>

/** La section courante, sous-pages comprises (préfixe de chemin). */
export function isCurrentSection(section: AdminSection, pathname: string): boolean {
  if (section.href === '/admin') return pathname === '/admin'
  return pathname === section.href || pathname.startsWith(`${section.href}/`)
}
