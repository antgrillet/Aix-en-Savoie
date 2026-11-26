import { prisma } from '@/lib/prisma'
import { bornesWeekend } from '@/lib/dates'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { libelleSaison } from '@/lib/saisons'
import { getATraiter } from '@/components/admin/a-traiter'
import { DashboardView } from '@/components/admin/DashboardView'
import { getEtatSynchro } from '@/components/admin/etat-synchro'
import { classerUrgences } from '@/components/admin/urgences'

export const dynamic = 'force-dynamic'

const TZ = 'Europe/Paris'
const jourDuMois = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: 'numeric' })
const jourEtMois = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: 'numeric', month: 'long' })
const mois = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, month: 'long' })

/** « 28 et 29 novembre », « 31 janvier et 1er février » : le samedi et le dimanche. */
function titreWeekend(vendredi: Date): string {
  const samedi = new Date(vendredi.getTime() + 36 * 60 * 60 * 1000)
  const dimanche = new Date(vendredi.getTime() + 60 * 60 * 60 * 1000)
  const premier = (date: Date) => (jourDuMois.format(date) === '1' ? '1er' : jourDuMois.format(date))
  if (mois.format(samedi) === mois.format(dimanche)) {
    return `${premier(samedi)} et ${premier(dimanche)} ${mois.format(dimanche)}`
  }
  return `${jourEtMois.format(samedi).replace(/^1 /, '1er ')} et ${jourEtMois.format(dimanche).replace(/^1 /, '1er ')}`
}

export default async function AdminDashboard() {
  const maintenant = new Date()
  const { debut, fin } = bornesWeekend(maintenant)

  const [aTraiter, synchro, saison, matchsWeekend, messages, messagesNonLus] = await Promise.all([
    getATraiter(),
    getEtatSynchro(),
    getSaisonAffichee(),
    prisma.match.findMany({
      where: { date: { gte: debut, lte: fin }, published: true },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        adversaire: true,
        lieu: true,
        domicile: true,
        competition: true,
        equipe: { select: { nom: true, categorie: true } },
      },
    }),
    prisma.contactMessage.findMany({
      where: { archived: false },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, nom: true, prenom: true, message: true, read: true, createdAt: true },
    }),
    prisma.contactMessage.count({ where: { read: false, archived: false } }),
  ])

  const domicile = matchsWeekend
    .filter((match) => match.domicile)
    .map(({ domicile: _domicile, ...match }) => match)

  return (
    <DashboardView
      maintenant={maintenant}
      titreWeekend={titreWeekend(debut)}
      saison={libelleSaison(saison)}
      urgences={classerUrgences(aTraiter, maintenant)}
      domicile={domicile}
      exterieur={matchsWeekend.length - domicile.length}
      synchro={synchro}
      messages={messages.map(({ message, ...reste }) => ({
        ...reste,
        extrait: message.replace(/\s+/g, ' ').slice(0, 90),
      }))}
      messagesNonLus={messagesNonLus}
    />
  )
}
