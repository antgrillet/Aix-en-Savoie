import { formatJourMoisChiffres } from '@/lib/dates'
import { Carte } from './Carte'
import { Ecusson } from './Ecusson'
import { estJoue, issueDe, type Issue, type MatchRepere } from './reperes'

const SCORE: Record<Issue, { lettre: string; libelle: string; texte: string }> = {
  victoire: { lettre: 'V', libelle: 'Victoire', texte: 'text-green-400' },
  defaite: { lettre: 'D', libelle: 'Défaite', texte: 'text-red-400' },
  nul: { lettre: 'N', libelle: 'Nul', texte: 'text-yellow-400' },
}

interface CalendrierEquipeProps {
  matchs: MatchRepere[]
  libelleSaison: string
}

export function CalendrierEquipe({ matchs, libelleSaison }: CalendrierEquipeProps) {
  return (
    <Carte
      titre="Calendrier"
      titreId="calendrier-equipe"
      action={<span className="text-sm font-medium text-neutral-400">Saison {libelleSaison}</span>}
    >
      {matchs.length === 0 ? (
        <p className="text-sm text-neutral-400">Aucun match publié pour cette saison.</p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Matchs de la saison {libelleSaison}</caption>
          <thead>
            <tr className="border-b border-white/10 text-xs text-neutral-400">
              <th scope="col" className="py-2 pr-2 text-left font-medium">Date</th>
              <th scope="col" className="px-2 py-2 text-left font-medium">Adversaire</th>
              <th scope="col" className="py-2 pl-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {matchs.map((match) => {
              const issue = estJoue(match) ? issueDe(match) : null
              return (
                <tr key={match.id} className="border-b border-white/10">
                  <td className="py-2.5 pr-2 align-middle text-xs text-neutral-300">
                    <span className="flex flex-col items-start gap-1 whitespace-nowrap sm:flex-row sm:items-center sm:gap-1.5">
                      <span className="tabular-nums">{formatJourMoisChiffres(match.date)}</span>
                      <span
                        className={`rounded-full px-2 py-px font-semibold ${
                          match.domicile ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        <span aria-hidden>{match.domicile ? 'Dom.' : 'Ext.'}</span>
                        <span className="sr-only">{match.domicile ? 'Domicile' : 'Extérieur'}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <span className="flex min-w-0 items-center gap-2.5 uppercase text-white">
                      <Ecusson nom={match.adversaire} logo={match.logoAdversaire} />
                      <span className="min-w-0 break-words">{match.adversaire}</span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-2.5 pl-2 text-right align-middle font-bold tabular-nums sm:text-base">
                    {issue && estJoue(match) ? (
                      <span className={SCORE[issue].texte}>
                        <span
                          aria-hidden
                          className="mr-1.5 inline-block h-5 w-5 rounded bg-white/10 text-center text-xs leading-5"
                        >
                          {SCORE[issue].lettre}
                        </span>
                        <span className="sr-only">{SCORE[issue].libelle}, </span>
                        {match.scoreEquipe} – {match.scoreAdversaire}
                      </span>
                    ) : (
                      <span className="text-neutral-500">
                        <span aria-hidden>–</span>
                        <span className="sr-only">À jouer</span>
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Carte>
  )
}
