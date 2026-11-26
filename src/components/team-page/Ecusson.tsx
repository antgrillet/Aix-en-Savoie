import Image from 'next/image'
import { initialesClub } from './reperes'

interface EcussonProps {
  nom: string
  logo: string | null | undefined
  taille?: number
}

/** Logo d'un club, ou ses initiales quand la fédération n'en fournit pas. Décoratif : le nom est écrit à côté. */
export function Ecusson({ nom, logo, taille = 26 }: EcussonProps) {
  if (logo) {
    return (
      <span className="relative shrink-0" style={{ width: taille, height: taille }} aria-hidden>
        <Image src={logo} alt="" fill sizes={`${taille}px`} className="object-contain" unoptimized />
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full bg-zinc-800 font-extrabold text-indigo-200"
      style={{ width: taille, height: taille, fontSize: 9 }}
    >
      {initialesClub(nom)}
    </span>
  )
}
