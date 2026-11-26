'use client'

export interface GroupeOption {
  value: string
  label: string
}

interface TeamsFiltersProps {
  groupes: GroupeOption[]
  activeGroupe: string
  onGroupeChange: (groupe: string) => void
}

/**
 * Groupe d'âge d'une équipe, lu dans son nom puis sa catégorie
 * (« -18.1M », « -15 Excellence », « U13 »). Sans âge : seniors, ou loisirs.
 */
export function getGroupe(nom: string, categorie: string): string {
  for (const texte of [nom, categorie]) {
    const age = texte.match(/(?:^|[\s(])(?:-|U)\s?(\d{1,2})(?!\d)/i)
    if (age) return `-${age[1]}`
  }
  if (/loisir/i.test(`${nom} ${categorie}`)) return 'loisirs'
  return 'seniors'
}

const LIBELLES: Record<string, string> = { seniors: 'Seniors', loisirs: 'Loisirs' }

/** Ordre d'affichage : seniors, puis des plus âgés aux plus jeunes, puis loisirs. */
function rangGroupe(groupe: string) {
  if (groupe === 'seniors') return -100
  if (groupe === 'loisirs') return 100
  return Number(groupe) // « -18 » → -18, « -9 » → -9
}

export function buildGroupeOptions(groupes: string[]): GroupeOption[] {
  return Array.from(new Set(groupes))
    .sort((a, b) => rangGroupe(a) - rangGroupe(b))
    .map((value) => ({ value, label: LIBELLES[value] ?? value }))
}

export function TeamsFilters({ groupes, activeGroupe, onGroupeChange }: TeamsFiltersProps) {
  const options: GroupeOption[] = [{ value: 'all', label: 'Toutes' }, ...groupes]

  return (
    <div
      className="mb-8 flex flex-wrap gap-2.5"
      role="group"
      aria-label="Filtrer les équipes par catégorie d'âge"
    >
      {options.map((option) => {
        const isActive = activeGroupe === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onGroupeChange(option.value)}
            aria-pressed={isActive}
            className={`min-h-11 rounded-full border px-4 font-mono text-sm uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 sm:px-[18px] ${
              isActive
                ? 'border-primary-500 bg-primary-500 font-bold text-zinc-950'
                : 'border-white/20 text-zinc-200 hover:border-white/40 hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
