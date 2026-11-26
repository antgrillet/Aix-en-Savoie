import { Suspense } from 'react'
import { AdminNav } from '@/components/admin/AdminNav'
import { AdminTheme } from '@/components/admin/AdminTheme'
import { AdminToaster } from '@/components/admin/AdminToaster'
import { AdminTopBar, type SynchroEnTete } from '@/components/admin/AdminTopBar'
import type { AdminCounts } from '@/components/admin/navigation'
import type { SaisonsAdmin } from '@/components/admin/saisons-admin'

interface AdminShellProps {
  /** Nombre d'éléments à traiter par section, pour la navigation */
  counts?: AdminCounts
  saisons: SaisonsAdmin
  synchro: SynchroEnTete
  /** Personne connectée */
  user?: { name?: string | null; email?: string | null }
  children: React.ReactNode
}

/**
 * Coque de l'admin : thème, barre latérale (ou onglets du téléphone), en-tête
 * avec la synchro et la saison, surface de travail sur fond chaud, toasts.
 * Rendue une seule fois, par `src/app/(admin)/admin/layout.tsx`.
 */
export function AdminShell({ counts, saisons, synchro, user, children }: AdminShellProps) {
  return (
    <>
      <AdminTheme />
      <div data-admin="shell" className="min-h-dvh bg-[color:var(--adm-bg)] text-foreground">
        <a href="#contenu" className="adm-skip">
          Aller au contenu
        </a>
        <AdminNav counts={counts} />

        <div className="lg:pl-[var(--adm-rail)]">
          {/* Le sélecteur lit `?saison=` : il attend le client, la page non */}
          <Suspense fallback={<div className="h-[var(--adm-topbar)] border-b border-border bg-background" />}>
            <AdminTopBar saisons={saisons} synchro={synchro} user={user} />
          </Suspense>
          <main
            id="contenu"
            className="min-h-[calc(100dvh-var(--adm-topbar))] pb-[calc(var(--adm-tabbar)+env(safe-area-inset-bottom))] lg:pb-0"
          >
            <div className="mx-auto w-full max-w-[80rem] px-[var(--adm-pad-x)] pb-[var(--adm-pad-b)] pt-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      <AdminToaster />
    </>
  )
}
