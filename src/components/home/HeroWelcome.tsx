import Image from 'next/image'
import Link from 'next/link'
import { ANTON, BOUTON, LIEN, SCRIPT } from './affiche'

interface HeroWelcomeProps {
  backgroundImage?: string | null
  /** Feuille de match de droite (prochain match, dernier résultat, domicile) */
  children?: React.ReactNode
}

const CHIFFRES = [
  { valeur: '320+', libelle: 'licenciés' },
  { valeur: '19', libelle: 'équipes' },
  { valeur: '50+', libelle: 'bénévoles' },
]

/**
 * Hero de l'accueil : la photo du gymnase, le titre façon affiche à gauche,
 * la feuille de match à droite. Un seul bouton plein, le reste en liens.
 */
export function HeroWelcome({ backgroundImage, children }: HeroWelcomeProps) {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] w-full items-end overflow-hidden bg-[#141210] pt-16 text-white">
      {backgroundImage && (
        <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,18,16,0.9)_0%,rgba(20,18,16,0.6)_55%,rgba(20,18,16,0.4)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#141210]" />

      <div className="container relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-end gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.04em] text-stone-200">
            Club de handball d&apos;Aix-les-Bains, depuis 1964
          </p>
          <h1 className="mt-4">
            <span className={`${SCRIPT} -mb-2 ml-1 block text-5xl md:-mb-4 md:text-6xl lg:text-[76px]`}>Bienvenue au</span>
            <span className={`${ANTON} block text-[52px] sm:text-6xl md:text-7xl lg:text-[96px]`}>
              HBC <span className="whitespace-nowrap">Aix-en-Savoie</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[32rem] text-lg leading-relaxed text-stone-200">
            Du baby hand à la Nationale 3 : une école de hand qui forme les joueurs du club, et des matchs tous
            les week-ends au gymnase.
          </p>
          <p className="mt-7 flex flex-wrap items-baseline gap-x-7 gap-y-2 text-sm text-stone-300">
            {CHIFFRES.map((chiffre) => (
              <span key={chiffre.libelle}>
                <b className={`${ANTON} mr-1 text-3xl text-white`}>{chiffre.valeur}</b> {chiffre.libelle}
              </span>
            ))}
          </p>
          <p className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/contact?sujet=inscription" className={BOUTON}>
              S&apos;inscrire au club
            </Link>
            <Link href="/equipes" className={LIEN}>
              Voir nos équipes
            </Link>
          </p>
        </div>

        <div className="w-full max-w-lg lg:justify-self-end">{children}</div>
      </div>
    </section>
  )
}
