import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ANTON, COULEUR_ISSUE, TitreAffiche } from './affiche'
import { Score, type EncartResultat } from './EncartsMatchs'

export interface CarteResultat extends EncartResultat {
  id: number
  /** « Nationale 3 masculine », sinon la catégorie de l'équipe */
  division: string
}

const LIBELLE_ISSUE = { victoire: 'Victoire', defaite: 'Défaite', nul: 'Nul' } as const

function Carte({ carte, copie }: { carte: CarteResultat; copie?: boolean }) {
  return (
    // La marge droite (et non un gap) garde la boucle exacte : la seconde moitié commence pile à -50 %
    <li aria-hidden={copie || undefined} className={`w-[250px] shrink-0 pr-4 ${copie ? "motion-reduce:hidden" : ""}`}>
      <Link
        href={carte.href}
        tabIndex={copie ? -1 : undefined}
        className="block h-full rounded-2xl border border-white/10 bg-zinc-950/60 px-5 py-4 text-white backdrop-blur-sm transition-colors hover:border-primary-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <span className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className={`${ANTON} block truncate text-[22px]`}>{carte.equipe}</span>
            <span className="block truncate text-xs text-zinc-400">{carte.division}</span>
          </span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
            style={{ color: COULEUR_ISSUE[carte.issue], backgroundColor: `${COULEUR_ISSUE[carte.issue]}1f` }}
          >
            {LIBELLE_ISSUE[carte.issue]}
          </span>
        </span>
        <span className={`${ANTON} mt-3.5 block text-[44px]`}>
          <Score resultat={carte} />
        </span>
        <span className="mt-1 block truncate text-[13px] text-zinc-400">
          {carte.domicile ? 'contre' : 'à'} {carte.adversaire}
        </span>
        <span className="mt-3.5 flex items-baseline justify-between border-t border-white/10 pt-3">
          <span className="text-[11px] font-bold tracking-[0.06em] text-zinc-400">CLASSEMENT</span>
          {carte.rang ? (
            <span>
              <b className={`${ANTON} text-[22px] text-primary-500`}>{carte.rang.position}</b>
              <span className="text-xs text-zinc-400"> / {carte.rang.total}</span>
            </span>
          ) : (
            <span className="text-xs text-zinc-400">Sans classement</span>
          )}
        </span>
      </Link>
    </li>
  )
}

/**
 * Dernier résultat de chaque équipe, à égalité, dans un bandeau qui défile :
 * l'ordre suit celui des équipes (SM1, SF1, SM2, autres seniors, -18, -15…).
 * Pause au survol ou au clavier ; sans animation si l'utilisateur la refuse.
 */
export function ResultatsDefilants({ cartes }: { cartes: CarteResultat[] }) {
  if (cartes.length === 0) return null

  return (
    <section aria-labelledby="titre-resultats" className="relative overflow-hidden bg-[#121416] py-20 md:py-28">
      <Image
        src="/img/home/affiche/texture-ardoise.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-90"
      />
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TitreAffiche id="titre-resultats" mot="Résultats" script="& classements" />
        <p className="mb-10 mt-4 text-center text-sm text-zinc-300">Le dernier match de chacune de nos équipes, des seniors aux plus jeunes</p>
      </div>

      <div className="group relative overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] [scrollbar-width:none] motion-safe:overflow-x-hidden">
        <ul
          aria-label="Derniers résultats par équipe"
          className="flex w-max py-1.5 motion-safe:animate-[marquee_90s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        >
          {cartes.map((carte) => (
            <Carte key={carte.id} carte={carte} />
          ))}
          {/* Seconde copie pour la boucle, ignorée par les lecteurs d'écran et le clavier */}
          {cartes.map((carte) => (
            <Carte key={`copie-${carte.id}`} carte={carte} copie />
          ))}
        </ul>
      </div>

      <div className="relative mt-10 text-center">
        <Link
          href="/equipes"
          className="inline-flex min-h-[50px] items-center gap-2 rounded-lg border border-white/30 px-6 font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Voir tous les classements
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
