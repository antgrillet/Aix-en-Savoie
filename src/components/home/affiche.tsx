/**
 * Éléments de la DA des affiches du club, partagés par la page d'accueil :
 * capitales Anton et mot manuscrit orange qui chevauche.
 * Les variables --font-anton et --font-script viennent de `@/lib/polices-affiche`.
 */

export const ANTON = 'font-[family-name:var(--font-anton)] font-normal uppercase leading-[0.92] tracking-[0.005em]'
export const SCRIPT = 'font-[family-name:var(--font-script)] font-normal normal-case leading-none text-[#ff7a1a]'

/** Fond sombre et papier légèrement teintés, plutôt que du noir et du blanc purs */
export const ENCRE = 'bg-[#141210]'
export const PAPIER = 'bg-[#f1efea]'

/** Lien texte souligné d'orange : les actions secondaires, à côté d'un seul bouton plein par zone */
export const LIEN =
  'inline-flex min-h-11 items-center border-b-2 border-primary-500 font-semibold transition-colors hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'

/** Bouton plein, un seul par zone */
export const BOUTON =
  'inline-flex min-h-[52px] items-center rounded bg-primary-500 px-6 font-bold text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900'

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
  align = 'left',
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
