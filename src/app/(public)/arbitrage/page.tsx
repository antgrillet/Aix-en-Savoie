import { PageBackground } from '@/components/layout/PageBackground'
import { ArbitrageForm, type MatchProposable } from '@/components/forms/ArbitrageForm'
import { buildMetadata } from '@/lib/seo'
import { prisma } from '@/lib/prisma'
import { getReglagesArbitrage } from '@/lib/arbitrage-reglages'
import { formatBareme } from '@/lib/arbitrage'

export const metadata = buildMetadata({
  title: 'Espace arbitres',
  description: "Note d'indemnisation des arbitres du HBC Aix-en-Savoie.",
  path: '/arbitrage',
  noindex: true,
  nofollow: true,
})

// Les matchs récents et le barème changent peu : relus toutes les 10 minutes.
export const revalidate = 600

const JOUR = 24 * 60 * 60 * 1000

const jourParis = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Paris',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const heureParis = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** Les matchs à domicile des six dernières semaines, pour préremplir la note. */
async function matchsRecents(): Promise<MatchProposable[]> {
  const maintenant = Date.now()
  try {
    const matchs = await prisma.match.findMany({
      where: {
        domicile: true,
        published: true,
        date: { gte: new Date(maintenant - 45 * JOUR), lte: new Date(maintenant + JOUR) },
      },
      orderBy: { date: 'desc' },
      take: 80,
      select: {
        id: true,
        date: true,
        adversaire: true,
        lieu: true,
        competition: true,
        equipe: { select: { nom: true } },
      },
    })
    return matchs.map((m) => ({
      id: m.id,
      jour: jourParis.format(m.date),
      heure: heureParis.format(m.date),
      categorie: m.equipe.nom,
      adversaire: m.adversaire,
      salle: m.lieu,
    }))
  } catch {
    // Sans la liste, l'arbitre saisit son match à la main.
    return []
  }
}

export default async function ArbitragePage() {
  const [matchs, reglages] = await Promise.all([matchsRecents(), getReglagesArbitrage()])

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900">
      <PageBackground />

      <div className="relative z-10 pb-20 pt-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary-500">
              Espace arbitres
            </p>
            <h1 className="mb-5 font-display text-4xl font-bold text-white md:text-6xl">
              Note d&apos;indemnisation
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-neutral-300">
              Vous avez arbitré pour le HBC Aix-en-Savoie : déclarez votre indemnité et vos frais
              ici, le club s&apos;occupe du reste.
            </p>
          </header>

          <ol className="mb-10 grid gap-3 sm:grid-cols-3" aria-label="Les étapes">
            {[
              ['1', 'Vous déposez', 'Le match, vos frais et vos tickets de péage ou de parking.'],
              ['2', 'Le bureau valide', 'Il vérifie la rencontre et signe la note.'],
              ['3', 'La trésorerie vire', 'La note signée part au comptable, vous êtes prévenu par e-mail.'],
            ].map(([numero, titre, texte]) => (
              <li key={numero} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 backdrop-blur-sm">
                <p className="flex items-center gap-2 font-semibold text-white">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-zinc-950">
                    {numero}
                  </span>
                  {titre}
                </p>
                <p className="mt-2 text-sm text-neutral-400">{texte}</p>
              </li>
            ))}
          </ol>

          <ArbitrageForm
            matchs={matchs}
            baremeKmCentimes={reglages.baremeKmCentimes}
            baremeLibelle={formatBareme(reglages.baremeKmCentimes)}
          />
        </div>
      </div>
    </div>
  )
}
