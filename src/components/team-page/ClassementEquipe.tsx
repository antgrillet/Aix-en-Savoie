import { Carte } from './Carte'
import { Ecusson } from './Ecusson'
import { estNotreClub, type LigneClassement } from './reperes'

const LOGO_CLUB = '/img/home/logo.png'

interface ClassementEquipeProps {
  lignes: LigneClassement[]
  /** Logos par nom de club en majuscules (repris des matchs). */
  logos: Map<string, string>
}

export function ClassementEquipe({ lignes, logos }: ClassementEquipeProps) {
  return (
    <Carte titre="Classement" titreId="classement-equipe">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Classement de la poule</caption>
        <thead>
          <tr className="border-b border-white/10 text-xs text-neutral-400">
            <th scope="col" className="w-9 py-2 pl-2 text-left font-medium">Pos</th>
            <th scope="col" className="px-2 py-2 text-left font-medium">Équipe</th>
            <th scope="col" className="w-12 py-2 pr-2 text-right font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((ligne) => {
            const nous = estNotreClub(ligne.club)
            const logo = nous ? LOGO_CLUB : logos.get(ligne.club.trim().toUpperCase())
            return (
              <tr
                key={ligne.id}
                aria-current={nous ? 'true' : undefined}
                className={`border-b border-white/10 ${nous ? 'bg-primary-500/20 font-bold text-primary-400' : 'text-white'}`}
              >
                <td className="py-2.5 pl-2 tabular-nums">{ligne.position}</td>
                <td className="px-2 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5 uppercase">
                    <Ecusson nom={ligne.club} logo={logo} taille={22} />
                    <span className="min-w-0 break-words">{ligne.club}</span>
                  </span>
                </td>
                <td className={`py-2.5 pr-2 text-right font-bold tabular-nums ${nous ? '' : 'text-white'}`}>
                  {ligne.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Carte>
  )
}
