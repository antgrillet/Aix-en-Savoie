import Image from 'next/image'
import Link from 'next/link'
import { ANTON, COULEUR_ISSUE, LIEN } from './affiche'

/** Une équipe d'un match, à gauche celle qui reçoit, comme sur les affiches */
export interface CampEncart {
  nom: string
  logo: string | null
  club: boolean
}

export interface EncartProchain {
  href: string
  /** « NATIONALE 3 MASCULINE » */
  competition: string
  exterieur: boolean
  /** « SAMEDI 28 NOV. » */
  jour: string
  /** « 20H00 » */
  heure: string
  salle: string
  gauche: CampEncart
  droite: CampEncart
}

export interface EncartResultat {
  href: string
  /** « SM1 » */
  equipe: string
  adversaire: string
  domicile: boolean
  scoreEquipe: number
  scoreAdversaire: number
  issue: 'victoire' | 'defaite' | 'nul'
  /** « 4e » et le nombre d'équipes, si le classement est connu */
  rang: { position: string; total: number } | null
}

export interface EncartDomicile {
  id: number
  heure: string
  equipe: string
  adversaire: string
}

interface EncartsMatchsProps {
  prochain: EncartProchain | null
  dernier: EncartResultat | null
  domicile: EncartDomicile[]
  /** Matchs à domicile du week-end qui ne tiennent pas dans la feuille */
  autresDomicile: number
}

const FILET = 'border-t border-white/10'

function Ecusson({ camp, aDroite }: { camp: CampEncart; aDroite?: boolean }) {
  return (
    <span className={`min-w-0 ${aDroite ? 'text-right' : ''}`}>
      <span className="relative inline-grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white">
        {camp.logo ? (
          <Image src={camp.logo} alt="" fill sizes="56px" className="object-contain p-1.5" unoptimized={!camp.club} />
        ) : (
          <span className={`${ANTON} text-base text-primary-700`}>{camp.nom.slice(0, 3)}</span>
        )}
      </span>
      <span className={`${ANTON} mt-2 block truncate text-xl`}>{camp.nom}</span>
    </span>
  )
}

/**
 * Feuille de match du hero : une seule surface pleine, le prochain match en tête,
 * puis le dernier résultat et les matchs à domicile en lignes séparées par des filets.
 */
export function EncartsMatchs({ prochain, dernier, domicile, autresDomicile }: EncartsMatchsProps) {
  if (!prochain && !dernier && domicile.length === 0) {
    return (
      <div className="rounded bg-[#141210]/95 p-6 text-white">
        <p className="font-semibold">Aucun match programmé pour le moment.</p>
        <Link href="/equipes" className={`${LIEN} mt-2 text-sm`}>
          Voir nos équipes
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded bg-[#141210]/95 text-white">
      {prochain && (
        <>
          <p className="flex items-center justify-between gap-3 bg-primary-500 px-5 py-2.5">
            <span className={`${ANTON} text-lg`}>Prochain match</span>
            <span className="truncate text-[13px] font-semibold">
              {prochain.competition ? `${prochain.competition} · ` : ''}
              {prochain.jour}
            </span>
          </p>
          <Link
            href={prochain.href}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 pb-4 pt-5 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
          >
            <Ecusson camp={prochain.gauche} />
            <span className="text-center">
              <span className={`${ANTON} block text-5xl text-[#ff7a1a] md:text-[56px]`}>{prochain.heure}</span>
              <span className="mx-auto block max-w-[11rem] truncate text-xs text-stone-400">
                {prochain.exterieur ? 'À l’extérieur' : 'À domicile'}, {prochain.salle}
              </span>
            </span>
            <Ecusson camp={prochain.droite} aDroite />
          </Link>
        </>
      )}

      <div className="px-5 pb-4">
        {dernier && (
          <Link
            href={dernier.href}
            className={`block py-3 text-sm text-stone-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${prochain ? FILET : ''}`}
          >
            Dernier résultat, {dernier.equipe} {dernier.domicile ? 'contre' : 'à'} {dernier.adversaire} :{' '}
            <b className={`${ANTON} text-xl text-white`}>
              <Score resultat={dernier} />
            </b>
            {dernier.rang && (
              <>
                . {dernier.rang.position} sur {dernier.rang.total}
              </>
            )}
          </Link>
        )}

        {domicile.length > 0 && (
          <>
            <p className={`pt-3 text-xs font-semibold tracking-[0.06em] text-stone-400 ${dernier || prochain ? FILET : ''}`}>
              À DOMICILE CE WEEK-END
            </p>
            <ul className="mt-1">
              {domicile.map((match) => (
                <li key={match.id} className={`grid grid-cols-[4rem_minmax(0,1fr)] items-baseline gap-3 py-2 ${FILET} first:border-t-0`}>
                  <span className={`${ANTON} text-xl text-[#ff7a1a]`}>{match.heure}</span>
                  <span className="truncate text-sm">
                    <b className="font-semibold">{match.equipe}</b>{' '}
                    <span className="text-stone-400">contre {match.adversaire}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="#planning-domicile" className={`${LIEN} mt-1 text-sm`}>
              {autresDomicile > 0
                ? `Tout le planning, ${autresDomicile} autre${autresDomicile > 1 ? 's' : ''} match${autresDomicile > 1 ? 's' : ''}`
                : 'Tout le planning'}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

/** Score dans l'ordre de l'affiche (équipe qui reçoit en premier), celui du club en couleur */
export function Score({ resultat }: { resultat: Pick<EncartResultat, 'domicile' | 'scoreEquipe' | 'scoreAdversaire' | 'issue'> }) {
  const nous = (
    <span style={resultat.issue === 'nul' ? undefined : { color: COULEUR_ISSUE[resultat.issue] }}>{resultat.scoreEquipe}</span>
  )
  return resultat.domicile ? (
    <>
      {nous}–{resultat.scoreAdversaire}
    </>
  ) : (
    <>
      {resultat.scoreAdversaire}–{nous}
    </>
  )
}
