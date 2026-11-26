'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ExternalLink, LogOut, MoreHorizontal, X } from 'lucide-react'
import { overlayClasses } from '@/components/admin/Dialog'
import { useDeconnexion } from '@/components/admin/useDeconnexion'
import {
  ADMIN_GROUPS,
  ADMIN_SECTIONS,
  isCurrentSection,
  type AdminCounts,
  type AdminSection,
} from '@/components/admin/navigation'

interface AdminNavProps {
  /** Nombre d'éléments à traiter par section ; une section absente n'a pas de compteur */
  counts?: AdminCounts
}

export const LOGO = '/img/home/logo.png'
const TAB_SECTIONS = ADMIN_SECTIONS.filter((section) => section.tab)
const MORE_SECTIONS = ADMIN_SECTIONS.filter((section) => !section.tab)

function Count({ value, section, className }: { value?: number; section: AdminSection; className: string }) {
  if (!value) return null
  return (
    <span className={className} data-tone={section.countTone}>
      {value > 99 ? '99+' : value}
      <span className="sr-only"> à traiter</span>
    </span>
  )
}

function SectionLink({
  section,
  current,
  count,
  onNavigate,
}: {
  section: AdminSection
  current: boolean
  count?: number
  onNavigate?: () => void
}) {
  const Icon = section.icon
  return (
    <Link
      href={section.href}
      aria-current={current ? 'page' : undefined}
      onClick={onNavigate}
      className="adm-nav-item"
    >
      <Icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
      <span className="truncate">{section.name}</span>
      <Count value={count} section={section} className="adm-nav-count" />
    </Link>
  )
}

function Groupes({
  pathname,
  counts,
  sections,
  onNavigate,
}: {
  pathname: string
  counts: AdminCounts
  sections?: AdminSection[]
  onNavigate?: () => void
}) {
  return (
    <>
      {ADMIN_GROUPS.map((group) => {
        const visibles = group.sections.filter((section) => !sections || sections.includes(section))
        if (visibles.length === 0) return null
        return (
          <div key={group.title}>
            <p className="adm-nav-group adm-micro">{group.title}</p>
            <ul className="space-y-0.5">
              {visibles.map((section) => (
                <li key={section.id}>
                  <SectionLink
                    section={section}
                    current={isCurrentSection(section, pathname)}
                    count={counts[section.id]}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </>
  )
}

/**
 * Navigation de l'admin : barre latérale blanche à partir de `lg`, rangée en
 * quatre groupes ; barre d'onglets en bas de l'écran en dessous, le reste dans
 * la feuille « Plus ». La section courante est reconnue par préfixe de chemin.
 */
export function AdminNav({ counts = {} }: AdminNavProps) {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const { deconnecter, enCours } = useDeconnexion()

  const moreIsCurrent = MORE_SECTIONS.some((section) => isCurrentSection(section, pathname))
  const moreCount = MORE_SECTIONS.reduce(
    // Les brouillons ne réclament rien : ils ne gonflent pas le compteur « Plus »
    (sum, section) => sum + (section.countTone === 'neutral' ? 0 : (counts[section.id] ?? 0)),
    0
  )

  return (
    <>
      {/* Grand écran : la barre latérale */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--adm-rail)] flex-col overflow-y-auto border-r border-border bg-background lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 pb-3 pt-5">
          <Image src={LOGO} alt="" width={40} height={40} className="size-10 shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block font-semibold">HBC Aix-en-Savoie</span>
            <span className="block text-[0.875rem] text-muted-foreground">Administration</span>
          </span>
        </Link>

        <nav aria-label="Sections de l'administration" className="flex-1 px-3 pb-4">
          <Groupes pathname={pathname} counts={counts} />
        </nav>

        <div className="border-t border-border px-3 py-3">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-item">
            <ExternalLink className="size-[1.125rem] shrink-0" aria-hidden="true" />
            <span>Voir le site</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </Link>
        </div>
      </aside>

      {/* Téléphone et tablette : barre d'onglets au pouce */}
      <nav
        aria-label="Sections de l'administration"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex h-[var(--adm-tabbar)] max-w-xl items-center gap-1 px-1.5">
          {TAB_SECTIONS.map((section) => {
            const Icon = section.icon
            const current = isCurrentSection(section, pathname)
            return (
              <li key={section.id} className="flex min-w-0 flex-1">
                <Link href={section.href} aria-current={current ? 'page' : undefined} className="adm-tab">
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="max-w-full truncate px-0.5">{section.tabName ?? section.name}</span>
                  <Count value={counts[section.id]} section={section} className="adm-tab-count" />
                </Link>
              </li>
            )
          })}
          <li className="flex min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              data-current={moreIsCurrent ? '' : undefined}
              className="adm-tab"
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
              <span>Plus</span>
              {moreCount > 0 && (
                <span className="adm-tab-count">
                  {moreCount > 99 ? '99+' : moreCount}
                  <span className="sr-only"> à traiter</span>
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>

      {/* « Plus » : le reste des sections, le site, la déconnexion */}
      <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className={`${overlayClasses} lg:hidden`} />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-background px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 text-foreground shadow-[0_-16px_40px_-8px_rgb(31_30_27/0.25)] duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom lg:hidden"
          >
            <div className="flex items-center justify-between pl-3">
              <DialogPrimitive.Title className="adm-h2">Toutes les sections</DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Fermer"
                className="grid size-11 place-content-center rounded-lg transition-colors duration-150 ease-out active:bg-muted"
              >
                <X className="size-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
            <div className="[&_.adm-nav-item]:min-h-12">
              <Groupes
                pathname={pathname}
                counts={counts}
                sections={MORE_SECTIONS}
                onNavigate={() => setMoreOpen(false)}
              />
            </div>
            <div className="mt-3 space-y-0.5 border-t border-border pt-3 [&_.adm-nav-item]:min-h-12">
              <Link href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-item">
                <ExternalLink className="size-[1.125rem] shrink-0" aria-hidden="true" />
                <span>Voir le site</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </Link>
              <button
                type="button"
                onClick={deconnecter}
                disabled={enCours}
                className="adm-nav-item w-full text-left disabled:opacity-60"
              >
                <LogOut className="size-[1.125rem] shrink-0" aria-hidden="true" />
                <span>{enCours ? 'Déconnexion…' : 'Déconnexion'}</span>
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
