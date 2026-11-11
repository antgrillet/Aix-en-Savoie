import { AdminNav } from '@/components/admin/AdminNav'
import { AdminTheme } from '@/components/admin/AdminTheme'
import { AdminToaster } from '@/components/admin/AdminToaster'
import type { AdminCounts } from '@/components/admin/navigation'

interface AdminShellProps {
  /** Nombre d'éléments à traiter par section, pour le rail et la barre d'onglets */
  counts?: AdminCounts
  /** Personne connectée */
  user?: { name?: string | null; email?: string | null }
  children: React.ReactNode
}

/**
 * Coque de l'admin : thème, navigation (rail ou barres du téléphone), surface
 * de travail blanche dont le coin est taillé par l'arc de zone, et toasts.
 * Rendue une seule fois, par `src/app/(admin)/admin/layout.tsx`.
 */
export function AdminShell({ counts, user, children }: AdminShellProps) {
  return (
    <>
      <AdminTheme />
      <div data-admin="shell" className="min-h-dvh bg-foreground text-foreground">
        <a href="#contenu" className="adm-skip">
          Aller au contenu
        </a>
        <AdminNav counts={counts} user={user} />

        {/* Le coin de la surface de travail, taillé par l'arc de zone */}
        <svg aria-hidden="true" focusable="false" viewBox="0 0 1 1" className="adm-arc-corner">
          <path d="M0 0H1A1 1 0 0 0 0 1Z" fill="currentColor" />
        </svg>

        <div className="lg:pl-[var(--adm-rail)]">
          <main
            id="contenu"
            className="min-h-[calc(100dvh-var(--adm-topbar))] bg-background pb-[calc(var(--adm-tabbar)+env(safe-area-inset-bottom))] lg:min-h-dvh lg:pb-0"
          >
            <div className="mx-auto w-full max-w-[76rem] px-[var(--adm-pad-x)] pb-[var(--adm-pad-b)] pt-6 lg:pt-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <AdminToaster />
    </>
  )
}
