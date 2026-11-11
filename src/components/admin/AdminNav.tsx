'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { ExternalLink, LogOut, MoreHorizontal, X } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { cn } from '@/lib/utils'
import { overlayClasses } from '@/components/admin/Dialog'
import {
  ADMIN_SECTIONS,
  isCurrentSection,
  type AdminCounts,
  type AdminSection,
} from '@/components/admin/navigation'

interface AdminNavProps {
  /** Nombre d'éléments à traiter par section ; une section absente n'a pas de compteur */
  counts?: AdminCounts
  /** Personne connectée, rappelée au pied du rail */
  user?: { name?: string | null; email?: string | null }
}

const LOGO = '/img/home/logo.png'
const TAB_SECTIONS = ADMIN_SECTIONS.filter((section) => section.tab)
const MORE_SECTIONS = ADMIN_SECTIONS.filter((section) => !section.tab)

function Count({ value, className }: { value?: number; className: string }) {
  if (!value) return null
  return (
    <span className={className}>
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
      <Count value={count} className="adm-nav-count" />
    </Link>
  )
}

/**
 * Navigation de l'admin : rail noir à partir de `lg`, barre haute et barre
 * d'onglets en dessous. La section courante est reconnue par préfixe de
 * chemin, sous-pages comprises.
 */
export function AdminNav({ counts = {}, user }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const moreIsCurrent = MORE_SECTIONS.some((section) => isCurrentSection(section, pathname))
  const moreCount = MORE_SECTIONS.reduce((sum, section) => sum + (counts[section.id] ?? 0), 0)

  return (
    <>
      {/* Grand écran : le rail */}
      <aside className="adm-rail fixed inset-y-0 left-0 z-40 hidden w-[var(--adm-rail)] flex-col overflow-y-auto bg-foreground text-background lg:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 pb-5 pt-6">
          <Image src={LOGO} alt="" width={48} height={48} className="size-12 shrink-0" priority />
          <span className="min-w-0 leading-tight">
            <span className="block font-semibold">HBC Aix-en-Savoie</span>
            <span className="block text-[0.8125rem] text-[color:var(--adm-on-ink-2)]">Administration</span>
          </span>
        </Link>

        <nav aria-label="Sections de l'administration" className="flex-1 px-3">
          <ul className="space-y-0.5">
            {ADMIN_SECTIONS.map((section) => (
              <li key={section.id}>
                <SectionLink
                  section={section}
                  current={isCurrentSection(section, pathname)}
                  count={counts[section.id]}
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 border-t border-[color:var(--adm-text-2)] px-3 pb-4 pt-3">
          {user?.email && (
            <p className="truncate px-3 pb-2 text-[0.8125rem] text-[color:var(--adm-on-ink-2)]" title={user.email}>
              {user.name || user.email}
            </p>
          )}
          <Link href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-item">
            <ExternalLink className="size-[1.125rem] shrink-0" aria-hidden="true" />
            <span>Voir le site</span>
            <span className="sr-only"> (nouvel onglet)</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="adm-nav-item w-full text-left disabled:opacity-60"
          >
            <LogOut className="size-[1.125rem] shrink-0" aria-hidden="true" />
            <span>{isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}</span>
          </button>
        </div>
      </aside>

      {/* Téléphone et tablette : barre haute */}
      <header className="sticky top-0 z-40 flex h-[var(--adm-topbar)] items-center gap-3 bg-foreground px-4 text-background lg:hidden">
        <Link href="/admin" className="flex min-h-11 items-center gap-2.5">
          <Image src={LOGO} alt="" width={36} height={36} className="size-9 shrink-0" priority />
          <span className="leading-tight">
            <span className="block text-[0.9375rem] font-semibold">HBC Aix-en-Savoie</span>
            <span className="block text-xs text-[color:var(--adm-on-ink-2)]">Administration</span>
          </span>
        </Link>
      </header>

      {/* Téléphone et tablette : barre d'onglets au pouce */}
      <nav
        aria-label="Sections de l'administration"
        className="fixed inset-x-0 bottom-0 z-40 bg-foreground pb-[env(safe-area-inset-bottom)] lg:hidden"
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
                  <Count value={counts[section.id]} className="adm-tab-count" />
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
              <Count value={moreCount} className="adm-tab-count" />
            </button>
          </li>
        </ul>
      </nav>

      {/* « Plus » : le reste des sections, le site, la déconnexion */}
      <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className={cn(overlayClasses, 'lg:hidden')} />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-tl-[var(--adm-arc)] bg-foreground px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-background shadow-[0_-16px_40px_-8px_rgb(34_34_33/0.45)] duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom lg:hidden"
          >
            <div className="flex items-center justify-between pl-[calc(var(--adm-arc)-0.75rem)] pr-0">
              <DialogPrimitive.Title className="adm-h2">Toutes les sections</DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Fermer"
                className="grid size-11 place-content-center rounded-[3px] transition-colors duration-150 ease-out active:bg-background active:text-foreground"
              >
                <X className="size-5" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
            <ul className="mt-2 space-y-0.5 [&_.adm-nav-item]:min-h-12">
              {MORE_SECTIONS.map((section) => (
                <li key={section.id}>
                  <SectionLink
                    section={section}
                    current={isCurrentSection(section, pathname)}
                    count={counts[section.id]}
                    onNavigate={() => setMoreOpen(false)}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-0.5 border-t border-[color:var(--adm-text-2)] pt-3 [&_.adm-nav-item]:min-h-12">
              <Link href="/" target="_blank" rel="noopener noreferrer" className="adm-nav-item">
                <ExternalLink className="size-[1.125rem] shrink-0" aria-hidden="true" />
                <span>Voir le site</span>
                <span className="sr-only"> (nouvel onglet)</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="adm-nav-item w-full text-left disabled:opacity-60"
              >
                <LogOut className="size-[1.125rem] shrink-0" aria-hidden="true" />
                <span>{isLoggingOut ? 'Déconnexion…' : 'Déconnexion'}</span>
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
