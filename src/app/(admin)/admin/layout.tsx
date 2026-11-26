import { requireAdmin } from '@/lib/auth-utils'
import { AdminShell } from '@/components/admin/AdminShell'
import { compteursParSection, getATraiter } from '@/components/admin/a-traiter'
import { getEtatSynchro } from '@/components/admin/etat-synchro'
import { getSaisonsAdmin, type SaisonsAdmin } from '@/components/admin/saisons-admin'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { libelleSaison } from '@/lib/saisons'
import { buildMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata = buildMetadata({
  title: 'Administration',
  description: "Espace d'administration du HBC Aix-en-Savoie.",
  path: '/admin',
  noindex: true,
  nofollow: true,
})

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Vérifier l'authentification
  const session = await requireAdmin()

  // Compteurs, saisons et synchro sont un confort : s'ils échouent, la coque
  // s'affiche sans eux et la page garde la main sur ses propres erreurs.
  const [counts, saisons, synchro] = await Promise.all([
    getATraiter()
      .then(compteursParSection)
      .catch(() => ({})),
    getSaisonsAdmin().catch(async (): Promise<SaisonsAdmin> => {
      const affichee = await getSaisonAffichee().catch(() => new Date().getFullYear())
      return {
        affichee,
        saisons: [{ saison: affichee, libelle: libelleSaison(affichee), etat: 'affichée sur le site' }],
        suivante: null,
      }
    }),
    getEtatSynchro()
      .then(({ tone, libelle, detail }) => ({ tone, libelle, detail }))
      .catch(() => ({
        tone: 'neutral' as const,
        libelle: 'synchro inconnue',
        detail: "L'état de la synchronisation FFHandball n'a pas pu être lu.",
      })),
  ])

  return (
    <AdminShell
      counts={counts}
      saisons={saisons}
      synchro={synchro}
      user={{ name: session.user.name, email: session.user.email }}
    >
      {children}
    </AdminShell>
  )
}
