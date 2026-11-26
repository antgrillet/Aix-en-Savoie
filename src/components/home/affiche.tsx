/**
 * Éléments de la DA des affiches du club, partagés par la page d'accueil :
 * capitales Anton et mot manuscrit orange qui chevauche.
 * Les variables --font-anton et --font-script viennent de `@/lib/polices-affiche`.
 */

export const ANTON = 'font-[family-name:var(--font-anton)] font-normal uppercase leading-[0.92] tracking-[0.005em]'
export const SCRIPT = 'font-[family-name:var(--font-script)] font-normal normal-case leading-none text-[#ff7a1a]'

/** Vert et rouge des visuels de résultats */
export const COULEUR_ISSUE = {
  victoire: '#1fa335',
  defaite: '#e1242c',
  nul: '#a1a1aa',
} as const

interface TitreAfficheProps {
  id?: string
  /** Mot en capitales Anton */
  mot: string
  /** Mot manuscrit orange qui chevauche */
  script?: string
  /** Le mot manuscrit passe au-dessus (« Venir » / « au club ») */
  scriptAvant?: boolean
  /** Couleur des capitales : claires sur fond sombre, noires sur fond gris */
  ton?: 'clair' | 'sombre'
  align?: 'center' | 'left'
  className?: string
}

export function TitreAffiche({
  id,
  mot,
  script,
  scriptAvant = false,
  ton = 'clair',
  align = 'center',
  className = '',
}: TitreAfficheProps) {
  const capitales = (
    <span className={`${ANTON} block text-6xl md:text-7xl lg:text-[104px] ${ton === 'clair' ? 'text-white' : 'text-zinc-950'}`}>
      {mot}
    </span>
  )
  const manuscrit = script ? (
    <span
      className={`${SCRIPT} block text-5xl md:text-6xl lg:text-[72px] ${
        scriptAvant
          ? '-mb-3 md:-mb-5'
          : `-mt-4 md:-mt-6 lg:-mt-8 ${align === 'center' ? 'pl-[28%] md:pl-[22%]' : 'pl-[30%]'}`
      }`}
    >
      {script}
    </span>
  ) : null

  return (
    <h2 id={id} className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      {scriptAvant ? manuscrit : null}
      {capitales}
      {scriptAvant ? null : manuscrit}
    </h2>
  )
}
