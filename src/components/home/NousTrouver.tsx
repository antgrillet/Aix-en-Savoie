import Link from 'next/link'
import { ANTON, BOUTON, LIEN } from './affiche'
import { ADRESSE_CLUB, gymnaseDuClub } from '@/lib/gymnases'

interface NousTrouverProps {
  /** Gymnase où le club reçoit, s'il est connu. */
  lieu: string | null
  itineraire: string
}

const LIGNE = 'border-t border-white/15 py-4'

/** Deux colonnes : le gymnase en grand à gauche, les infos pratiques en liste à droite */
export function NousTrouver({ lieu, itineraire }: NousTrouverProps) {
  // L'adresse affichée est celle du gymnase où le club reçoit ; sans lieu connu, celle du club
  const adresse = lieu ? gymnaseDuClub(lieu)?.adresse ?? null : ADRESSE_CLUB
  return (
    <section aria-labelledby="titre-venir" className="bg-[#141210] py-20 text-white md:py-24">
      <div className="container mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:px-8">
        <div>
          <h2 id="titre-venir" className={`${ANTON} text-5xl md:text-[72px]`}>
            Venir au club
          </h2>
          <p className={`${ANTON} mt-7 text-3xl leading-[1.05] md:text-[34px]`}>
            {lieu ?? 'Nos gymnases'}
            {adresse && <span className="block text-[#ff7a1a]">{adresse}</span>}
          </p>
          <p className="mt-4 max-w-md leading-relaxed text-stone-300">
            {lieu
              ? 'Tous nos matchs à domicile s’y jouent.'
              : 'Le lieu de chaque rencontre est indiqué sur la page de l’équipe.'}
          </p>
          <a href={itineraire} target="_blank" rel="noopener noreferrer" className={`${LIEN} mt-3`}>
            Itinéraire
            <span className="sr-only">(ouvre Google Maps dans un nouvel onglet)</span>
          </a>
        </div>

        <div className="self-end">
          <dl>
            <div className={LIGNE}>
              <dt className="text-[13px] text-stone-400">Secrétariat</dt>
              <dd className="mt-1">Du lundi au vendredi, 9 h – 18 h · samedi, 9 h – 12 h</dd>
            </div>
            <div className={LIGNE}>
              <dt className="text-[13px] text-stone-400">Nous écrire</dt>
              <dd className="mt-1 flex flex-wrap items-baseline gap-x-5">
                <a href="mailto:contact@hbcaixensavoie.fr" className="hover:text-primary-400">
                  contact@hbcaixensavoie.fr
                </a>
                <Link href="/contact" className={`${LIEN} text-sm`}>
                  Formulaire de contact
                </Link>
              </dd>
            </div>
            <div className={LIGNE}>
              <dt className="text-[13px] text-stone-400">Rejoindre le club</dt>
              <dd className="mt-1 leading-relaxed">
                Du baby hand aux seniors, joueurs et bénévoles, toute l&apos;année.{' '}
                <Link href="/equipes" className={`${LIEN} text-sm`}>
                  Voir les catégories
                </Link>
              </dd>
            </div>
          </dl>
          <Link href="/contact?sujet=inscription" className={`${BOUTON} mt-4`}>
            Demander une inscription
          </Link>
        </div>
      </div>
    </section>
  )
}
