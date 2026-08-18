import Link from 'next/link'
import { ArrowRight, Users } from 'lucide-react'

export function JoinClubCTA() {
  return (
    <section className="bg-zinc-950 py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-primary-500/30 bg-primary-500/10 p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-500/20 mb-5">
            <Users className="w-6 h-6 text-primary-400" />
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
            Envie de rejoindre le club ?
          </h2>
          <p className="text-neutral-300 max-w-2xl mx-auto mb-8">
            Du Baby Hand aux seniors, nous accueillons de nouveaux joueurs toute l&apos;année.
            Parents, joueurs ou futurs bénévoles : dites-nous ce qui vous intéresse, nous vous
            recontactons rapidement.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact?sujet=inscription"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Demander une inscription
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/equipes"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Voir les catégories
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
