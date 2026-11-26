'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { TeamsGrid } from './TeamsGrid'
import { TeamsFilters, buildGroupeOptions, getGroupe } from './TeamsFilters'
import type { EquipeListe } from './types'

interface TeamsPageClientProps {
  equipes: EquipeListe[]
}

export function TeamsPageClient({ equipes }: TeamsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const equipesAvecGroupe = useMemo(
    () => equipes.map((equipe) => ({ equipe, groupe: getGroupe(equipe.nom, equipe.categorie) })),
    [equipes]
  )

  const groupes = useMemo(
    () => buildGroupeOptions(equipesAvecGroupe.map(({ groupe }) => groupe)),
    [equipesAvecGroupe]
  )

  // Un paramètre inconnu (ancien lien, faute de frappe) retombe sur « Toutes ».
  const demande = searchParams.get('categorie')
  const activeGroupe = groupes.some((g) => g.value === demande) ? (demande as string) : 'all'

  const filteredEquipes = useMemo(
    () =>
      equipesAvecGroupe
        .filter(({ groupe }) => activeGroupe === 'all' || groupe === activeGroupe)
        .map(({ equipe }) => equipe),
    [equipesAvecGroupe, activeGroupe]
  )

  const handleGroupeChange = useCallback(
    (groupe: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (groupe === 'all') {
        params.delete('categorie')
      } else {
        params.set('categorie', groupe)
      }
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <section id="liste-equipes" aria-label="Liste des équipes">
      {groupes.length > 1 && (
        <TeamsFilters
          groupes={groupes}
          activeGroupe={activeGroupe}
          onGroupeChange={handleGroupeChange}
        />
      )}

      <TeamsGrid equipes={filteredEquipes} />
    </section>
  )
}
