// Libellés des catégories et genres d'équipe, partagés entre la liste (client) et la fiche (serveur)

export interface CategoryOption {
  value: string
  label: string
}

/** Libellés « parents » pour les catégories fédérales, du plus jeune au plus âgé. */
const CATEGORY_LABELS: Record<string, string> = {
  Découverte: 'Baby Hand',
  Départemental: '-13 ans / -11 ans',
  Excellence: '-15 ans',
  Elite: '-18 ans',
  Prénationale: 'Prénationale',
  N2F: 'Nationale 2 Féminine',
  N2M: 'Nationale 2 Masculine',
  Mixte: 'Loisirs',
}

/** Ordre d'affichage : des plus jeunes vers les seniors. */
const CATEGORY_ORDER = [
  'Découverte',
  'Départemental',
  'Excellence',
  'Elite',
  'Prénationale',
  'N2F',
  'N2M',
  'Mixte',
]

export function getCategoryLabel(categorie: string) {
  return CATEGORY_LABELS[categorie] ?? categorie
}

export function buildCategoryOptions(categories: string[]): CategoryOption[] {
  const unique = Array.from(new Set(categories.filter(Boolean)))

  unique.sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a)
    const indexB = CATEGORY_ORDER.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b, 'fr')
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  return unique.map((value) => ({ value, label: getCategoryLabel(value) }))
}

export function getGenreLabel(genre: string | null | undefined) {
  if (genre === 'FEMININ') return 'Féminine'
  if (genre === 'MASCULIN') return 'Masculine'
  return genre ?? ''
}

/** Repère la ligne du club dans un classement fédéral */
export function isClubRow(club: string) {
  const name = club.toUpperCase()
  return name.includes('HBC AIX') || name.includes('AIX EN SAVOIE')
}

/** Suffixe ordinal (« er » / « e ») d'une position au classement */
export function rankSuffix(position: number) {
  return position === 1 ? 'er' : 'e'
}
