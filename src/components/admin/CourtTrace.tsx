import { cn } from '@/lib/utils'

/**
 * Demi-terrain de handball vu de dessus, but en haut. Unité : le décimètre
 * (terrain de 20 m de large, zone à 6 m, jet franc à 9 m, jet de 7 m).
 * Chaque ligne se trace une fois à l'affichage ; sous « mouvement réduit »,
 * le tracé est simplement là.
 */
const LINES: { d: string; dashed?: boolean; delay: number; duration: number }[] = [
  // Ligne de but et lignes de touche
  { d: 'M0 200V0H200V200', delay: 0, duration: 700 },
  // But
  { d: 'M85 0V-10H115V0', delay: 150, duration: 300 },
  // Zone : deux quarts de cercle de 6 m reliés par 3 m de droite, trait plein
  { d: 'M25 0A60 60 0 0 0 85 60H115A60 60 0 0 0 175 0', delay: 300, duration: 700 },
  // Jet de 7 m
  { d: 'M95 70H105', delay: 850, duration: 200 },
  // Jet franc à 9 m : pointillé
  { d: 'M0 29.58A90 90 0 0 0 85 90H115A90 90 0 0 0 200 29.58', dashed: true, delay: 550, duration: 800 },
  // Ligne médiane
  { d: 'M0 200H200', delay: 900, duration: 500 },
]

interface CourtTraceProps {
  className?: string
  /** `slice` remplit la largeur et laisse dépasser le bas (bandeau du téléphone) */
  fit?: 'meet' | 'slice'
}

export function CourtTrace({ className, fit = 'meet' }: CourtTraceProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="-10 -14 220 228"
      preserveAspectRatio={`xMidYMin ${fit}`}
      className={cn('adm-court', className)}
    >
      <defs>
        {LINES.map((line, index) => (
          <mask
            key={index}
            id={`adm-court-${fit}-${index}`}
            maskUnits="userSpaceOnUse"
            x="-20"
            y="-24"
            width="240"
            height="248"
          >
            <path
              d={line.d}
              pathLength={1}
              className="adm-court__draw"
              style={{ animationDelay: `${line.delay}ms`, animationDuration: `${line.duration}ms` }}
            />
          </mask>
        ))}
      </defs>
      {LINES.map((line, index) => (
        <path
          key={index}
          d={line.d}
          mask={`url(#adm-court-${fit}-${index})`}
          className="adm-court__line"
          strokeDasharray={line.dashed ? '7 7' : undefined}
        />
      ))}
    </svg>
  )
}
