import { siteCard } from '@/components/site/styles'
import { cn } from '@/lib/utils'
import { isClubRow } from './categories'

interface Classement {
  id: number
  position: number
  club: string
  points: number
}

interface StandingsTableProps {
  classement: Classement[]
}

/** Classement de la poule, ligne du club mise en évidence */
export function StandingsTable({ classement }: StandingsTableProps) {
  return (
    <div className={cn(siteCard, 'overflow-hidden')}>
      <table className="w-full text-sm">
        <caption className="sr-only">Classement de la poule</caption>
        <thead>
          <tr className="border-b border-white/10 font-eyebrow text-[0.65rem] text-neutral-500">
            <th scope="col" className="w-14 px-3 py-3 text-center font-bold">
              Pos.
            </th>
            <th scope="col" className="py-3 pr-3 text-left font-bold">
              Équipe
            </th>
            <th scope="col" className="w-16 px-4 py-3 text-right font-bold">
              Pts
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {classement.map((team) => {
            const isOurTeam = isClubRow(team.club)
            return (
              <tr key={team.id} className={cn(isOurTeam && 'bg-primary-500/10')}>
                <td
                  className={cn(
                    'relative px-3 py-2.5 text-center',
                    isOurTeam && 'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-primary-500'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-7 items-center justify-center rounded-md font-headline text-base tabular-nums',
                      isOurTeam ? 'bg-primary-500 text-neutral-950' : 'text-neutral-400'
                    )}
                  >
                    {team.position}
                  </span>
                </td>
                <td className={cn('py-2.5 pr-3', isOurTeam ? 'font-semibold text-primary-300' : 'text-neutral-200')}>
                  {team.club}
                </td>
                <td
                  className={cn(
                    'px-4 py-2.5 text-right font-headline text-lg tabular-nums',
                    isOurTeam ? 'text-primary-300' : 'text-white'
                  )}
                >
                  {team.points}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
