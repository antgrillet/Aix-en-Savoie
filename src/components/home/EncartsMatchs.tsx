import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ANTON, COULEUR_ISSUE, SCRIPT } from './affiche'

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
  /** Matchs à domicile du week-end qui ne tiennent pas dans l'encart */
  autresDomicile: number
}

const LIBELLE_ISSUE = { victoire: 'Victoire', defaite: 'Défaite', nul: 'Nul' } as const

const CARTE =
  'block rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-md text-white shadow-[0_24px_50px_-24px_rgba(0,0,0,0.8)] transition-colors hover:border-primary-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

function Ecusson({ camp }: { camp: CampEncart }) {
  return (
    <span className="text-center">
      <span className="relative mx-auto grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white md:h-[72px] md:w-[72px]">
        {camp.logo ? (
          <Image
            src={camp.logo}
            alt=""
            fill
            sizes="72px"
            className="object-contain p-2"
            unoptimized={!camp.club}
          />
        ) : (
          <span className={`${ANTON} text-lg text-primary-700`}>{camp.nom.slice(0, 3)}</span>
        )}
      </span>
      <span className={`${ANTON} mt-2 block truncate text-lg md:text-xl`}>{camp.nom}</span>
    </span>
  )
}

/**
 * Encarts du hero : prochain match, dernier résultat et matchs à domicile,
 * dans la typographie des affiches, sans photo (le hero en a déjà une).
 */
export function EncartsMatchs({ prochain, dernier, domicile, autresDomicile }: EncartsMatchsProps) {
  if (!prochain && !dernier && domicile.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-center text-white backdrop-blur-md">
        <p className="font-semibold">Aucun match programmé pour le moment</p>
        <Link
          href="/equipes"
          className="mt-3 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary-400 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Découvrir nos équipes
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3.5">
      {prochain && (
        <Link href={prochain.href} className={`${CARTE} relative overflow-hidden px-6 pb-5 pt-5`}>
          {/* Éclats des affiches */}
          <svg
            aria-hidden="true"
            viewBox="0 0 220 90"
            preserveAspectRatio="none"
            className="pointer-events-none absolute right-0 top-0 h-[90px] w-[220px]"
          >
            <polygon points="220,0 220,34 60,0" fill="#ee560c" />
            <polygon points="220,22 220,48 120,18" fill="#fff" opacity=".9" />
          </svg>
          <span className="relative flex items-baseline gap-2">
            <span className={`${ANTON} text-[22px]`}>Prochain</span>
            <span className={`${SCRIPT} text-3xl`}>match</span>
          </span>
          <span className="mt-0.5 block text-xs tracking-[0.08em] text-zinc-400">
            {prochain.competition}
            {prochain.competition ? ' · ' : ''}
            {prochain.exterieur ? "À L'EXTÉRIEUR" : 'À DOMICILE'}
          </span>
          <span className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Ecusson camp={prochain.gauche} />
            <span className="text-center">
              <span className="block text-xs font-semibold text-zinc-400">{prochain.jour}</span>
              <span className={`${ANTON} block text-5xl text-[#ff7a1a] md:text-[58px]`}>{prochain.heure}</span>
              <span className="mx-auto block max-w-[11rem] truncate text-xs text-zinc-400">{prochain.salle}</span>
            </span>
            <Ecusson camp={prochain.droite} />
          </span>
        </Link>
      )}

      {(dernier || domicile.length > 0) && (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {dernier && (
            <Link href={dernier.href} className={`${CARTE} px-5 py-4`}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-xs tracking-[0.08em] text-zinc-400">DERNIER RÉSULTAT · {dernier.equipe}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase"
                  style={{ color: COULEUR_ISSUE[dernier.issue], backgroundColor: `${COULEUR_ISSUE[dernier.issue]}1f` }}
                >
                  {LIBELLE_ISSUE[dernier.issue]}
                </span>
              </span>
              <span className={`${ANTON} mt-2.5 block text-[46px]`}>
                <Score resultat={dernier} />
              </span>
              <span className="mt-1.5 flex justify-between gap-2 border-t border-white/10 pt-2.5 text-[13px] text-zinc-400">
                <span className="truncate">
                  {dernier.domicile ? 'contre' : 'à'} {dernier.adversaire}
                </span>
                {dernier.rang && (
                  <span className="shrink-0">
                    <b className="text-white">{dernier.rang.position}</b> / {dernier.rang.total}
                  </span>
                )}
              </span>
            </Link>
          )}

          {domicile.length > 0 && (
            <Link href="#planning-domicile" className={`${CARTE} px-5 py-4`}>
              <span className="text-xs tracking-[0.08em] text-zinc-400">À DOMICILE CE WEEK-END</span>
              {domicile.map((match) => (
                <span key={match.id} className="mt-2 flex items-baseline gap-2.5">
                  <span className={`${ANTON} text-2xl text-primary-500`}>{match.heure}</span>
                  <span className="truncate text-sm font-semibold">
                    {match.equipe} · {match.adversaire}
                  </span>
                </span>
              ))}
              <span className="mt-2.5 flex items-center gap-1.5 border-t border-white/10 pt-2.5 text-[13px] font-semibold text-primary-400">
                {autresDomicile > 0
                  ? `+ ${autresDomicile} autre${autresDomicile > 1 ? 's' : ''} match${autresDomicile > 1 ? 's' : ''}`
                  : 'Tout le planning'}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
            </Link>
          )}
        </div>
      )}
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
      {nous} – {resultat.scoreAdversaire}
    </>
  ) : (
    <>
      {resultat.scoreAdversaire} – {nous}
    </>
  )
}
