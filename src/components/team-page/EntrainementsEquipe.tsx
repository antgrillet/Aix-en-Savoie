import Link from 'next/link'
import { Clock, MapPin } from 'lucide-react'
import { Carte } from './Carte'

interface Entrainement {
  id: number
  jour: string
  horaire: string
  lieu: string | null
}

export function EntrainementsEquipe({ entrainements }: { entrainements: Entrainement[] }) {
  return (
    <Carte titre="Entraînements" titreId="entrainements-equipe">
      <ul className="space-y-2.5">
        {entrainements.map((seance) => (
          <li key={seance.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="font-bold text-white">{seance.jour}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-300">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {seance.horaire}
            </p>
            {seance.lieu && (
              <p className="flex items-center gap-1.5 text-sm text-neutral-300">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {seance.lieu}
              </p>
            )}
          </li>
        ))}
      </ul>
    </Carte>
  )
}

export function RejoindreEquipe({ nom }: { nom: string }) {
  return (
    <section
      aria-labelledby="rejoindre-equipe"
      className="flex flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-6 text-white"
    >
      <h2 id="rejoindre-equipe" className="break-words font-display text-xl font-black uppercase leading-tight sm:text-2xl">
        Envie de rejoindre {nom}&nbsp;?
      </h2>
      <p className="font-medium text-white/95">Dites-nous ce qui vous intéresse, nous vous répondons rapidement.</p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        <Link
          href="/contact?sujet=inscription"
          className="inline-flex min-h-11 items-center rounded-full bg-white px-5 font-extrabold text-zinc-950 transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
        >
          Demander une inscription
        </Link>
        <Link
          href="/contact?sujet=question"
          className="inline-flex min-h-11 items-center rounded-full border border-white/70 px-5 font-extrabold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
        >
          Contacter le staff
        </Link>
      </div>
    </section>
  )
}
