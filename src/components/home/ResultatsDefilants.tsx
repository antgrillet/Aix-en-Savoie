import Image from 'next/image'
import Link from 'next/link'
import { ANTON, COULEUR_ISSUE, LIEN } from './affiche'
import { Score, type EncartResultat } from './EncartsMatchs'

export interface CarteResultat extends EncartResultat {
  id: number
  /** « Nationale 3 masculine », sinon la catégorie de l'équipe */
  division: string
}

const LETTRE_ISSUE = { victoire: 'V', defaite: 'D', nul: 'N' } as const
const LIBELLE_ISSUE = { victoire: 'Victoire', defaite: 'Défaite', nul: 'Nul' } as const

function Resultat({ carte, copie }: { carte: CarteResultat; copie?: boolean }) {
  return (
    // La largeur fixe (et non un gap) garde la boucle exacte : la seconde moitié commence pile à -50 %
    <li aria-hidden={copie || undefined} className={`w-[230px] shrink-0 border-l border-white/15 ${copie ? 'motion-reduce:hidden' : ''}`}>
      <Link
        href={carte.href}
        tabIndex={copie ? -1 : undefined}
        className="block px-6 py-1 text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      >
        <span className={`${ANTON} block truncate text-[22px]`}>{carte.equipe}</span>
        <span className="block truncate text-xs text-stone-400">{carte.division}</span>
        <span className={`${ANTON} mt-3.5 block text-[46px]`}>
          <Score resultat={carte} />
        </span>
        <span className="mt-1.5 block truncate text-[13px] text-stone-300">
          <abbr title={LIBELLE_ISSUE[carte.issue]} className="font-bold no-underline" style={{ color: COULEUR_ISSUE[carte.issue] }}>
            {LETTRE_ISSUE[carte.issue]}
          </abbr>{' '}
          · {carte.domicile ? 'contre' : 'à'} {carte.adversaire}
        </span>
        <span className="mt-1 block text-[13px] text-stone-400">
          {carte.rang ? `${carte.rang.position} sur ${carte.rang.total}` : 'Pas de classement'}
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
    <section aria-labelledby="titre-resultats" className="relative overflow-hidden bg-[#121416] py-20 text-white md:py-24">
      <Image src="/img/home/affiche/texture-ardoise.jpg" alt="" fill sizes="100vw" className="object-cover opacity-75" />
      <div className="container relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 id="titre-resultats" className={`${ANTON} text-5xl md:text-[72px]`}>
            Résultats
          </h2>
          <p className="mt-3 text-stone-300">Le dernier match de chaque équipe, des seniors aux plus jeunes.</p>
        </div>
        <Link href="/equipes" className={LIEN}>
          Tous les classements
        </Link>
      </div>

      <div className="group relative mt-11 overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)] [scrollbar-width:none] motion-safe:overflow-x-hidden">
        <ul
          aria-label="Derniers résultats par équipe"
          className="flex w-max motion-safe:animate-[marquee_80s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        >
          {cartes.map((carte) => (
            <Resultat key={carte.id} carte={carte} />
          ))}
          {/* Seconde copie pour la boucle, ignorée par les lecteurs d'écran et le clavier */}
          {cartes.map((carte) => (
            <Resultat key={`copie-${carte.id}`} carte={carte} copie />
          ))}
        </ul>
      </div>
    </section>
  )
}
