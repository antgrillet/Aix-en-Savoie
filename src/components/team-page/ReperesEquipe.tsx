import type { ReactNode } from 'react'
import { formatDateHeure } from '@/lib/dates'
import { issueDe, rangOrdinal, type Issue, type Reperes } from './reperes'

const COULEUR_SCORE: Record<Issue, string> = {
  victoire: 'text-green-400',
  defaite: 'text-red-400',
  nul: 'text-yellow-400',
}

const PASTILLE_FORME: Record<Issue, { lettre: string; libelle: string; classes: string }> = {
  victoire: { lettre: 'V', libelle: 'Victoire', classes: 'bg-green-400/20 text-green-400' },
  defaite: { lettre: 'D', libelle: 'Défaite', classes: 'bg-red-400/20 text-red-400' },
  nul: { lettre: 'N', libelle: 'Nul', classes: 'bg-yellow-400/20 text-yellow-400' },
}

const COLONNES: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

function Repere({ libelle, children }: { libelle: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-zinc-900/70 px-5 py-4 backdrop-blur-sm">
      <dt className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-neutral-400">{libelle}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  )
}

/**
 * Les quatre repères. Un repère sans donnée (pas de match programmé, pas de
 * classement…) n'est pas affiché : la grille se resserre sur ceux qui restent.
 */
export function ReperesEquipe({ reperes }: { reperes: Reperes }) {
  const { prochain, dernier, forme, rang } = reperes
  const cartes: ReactNode[] = []

  if (prochain) {
    cartes.push(
      <Repere key="prochain" libelle="Prochain match">
        <p className="break-words font-display text-lg font-extrabold uppercase leading-tight text-white">
          {prochain.adversaire}
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          {formatDateHeure(prochain.date)} · {prochain.domicile ? 'Domicile' : 'Extérieur'}
        </p>
      </Repere>
    )
  }

  if (dernier) {
    const issue = issueDe(dernier)
    cartes.push(
      <Repere key="dernier" libelle="Dernier résultat">
        <p className={`font-display text-4xl font-black tabular-nums leading-tight ${COULEUR_SCORE[issue]}`}>
          <span className="sr-only">{PASTILLE_FORME[issue].libelle}, </span>
          {dernier.scoreEquipe} – {dernier.scoreAdversaire}
        </p>
        <p className="mt-1 break-words text-xs text-neutral-400">{dernier.adversaire}</p>
      </Repere>
    )
  }

  if (forme.length > 0) {
    cartes.push(
      <Repere key="forme" libelle="Forme">
        <ol className="my-1.5 flex gap-2" aria-label="Résultats, du plus ancien au plus récent">
          {forme.map((match) => {
            const pastille = PASTILLE_FORME[issueDe(match)]
            return (
              <li
                key={match.id}
                className={`inline-grid h-9 w-9 place-items-center rounded-lg text-[15px] font-extrabold ${pastille.classes}`}
              >
                <span aria-hidden>{pastille.lettre}</span>
                <span className="sr-only">
                  {pastille.libelle} contre {match.adversaire}, {match.scoreEquipe} à {match.scoreAdversaire}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="text-xs text-neutral-400">
          {forme.length === 1 ? 'Dernier match' : `${forme.length} derniers matchs`}
        </p>
      </Repere>
    )
  }

  if (rang) {
    cartes.push(
      <Repere key="rang" libelle="Classement">
        <p className="font-display text-4xl font-black leading-tight text-white">{rangOrdinal(rang.ligne.position)}</p>
        <p className="mt-1 text-xs text-neutral-400">
          {rang.ligne.points} pts · sur {rang.total}
        </p>
      </Repere>
    )
  }

  if (cartes.length === 0) return null

  return (
    <section aria-label="L'équipe en bref">
      <dl className={`grid grid-cols-1 gap-4 ${COLONNES[cartes.length]}`}>{cartes}</dl>
    </section>
  )
}
