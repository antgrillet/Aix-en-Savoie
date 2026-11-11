import { addWeeks, isSameWeek, isThisWeek } from 'date-fns'
import { PageHeader } from '@/components/admin/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/admin/Tabs'
import { getAllInscriptions, getInscriptionsStats } from './actions'
import { InscriptionsTable } from './InscriptionsTable'
import { ManquesResume } from './ManquesResume'

export const metadata = {
  title: 'Inscriptions - Admin',
  description: 'Gérer les inscriptions aux matchs',
}

// Le vendredi d'un week-end est calculé à minuit, heure du serveur : ses
// libellés se formatent donc sans fuseau imposé.
const formatPeriode = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const formatQuantieme = new Intl.DateTimeFormat('fr-FR', { day: 'numeric' })
const formatJourMois = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })
const formatJourMoisAnnee = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function dimancheDe(friday: Date) {
  const sunday = new Date(friday)
  sunday.setDate(friday.getDate() + 2)
  return sunday
}

/** Vendredi du week-end auquel un match est rattaché (règle inchangée) */
function vendrediDe(date: Date) {
  const matchDate = new Date(date)
  const dayOfWeek = matchDate.getDay()
  const friday = new Date(matchDate)
  friday.setDate(matchDate.getDate() - (dayOfWeek - 5))
  friday.setHours(0, 0, 0, 0)
  return friday
}

/** « Cette semaine », « Semaine prochaine », puis le week-end par ses dates */
function nommerWeekend(friday: Date): { titre: string; periode?: string } {
  const sunday = dimancheDe(friday)
  const periode = formatPeriode.formatRange(friday, sunday)

  if (isThisWeek(friday, { weekStartsOn: 1 })) {
    return { titre: 'Cette semaine', periode }
  }

  if (isSameWeek(friday, addWeeks(new Date(), 1), { weekStartsOn: 1 })) {
    return { titre: 'Semaine prochaine', periode }
  }

  const debut =
    friday.getMonth() === sunday.getMonth()
      ? formatQuantieme.format(friday)
      : formatJourMois.format(friday)
  const fin =
    sunday.getFullYear() === new Date().getFullYear()
      ? formatJourMois.format(sunday)
      : formatJourMoisAnnee.format(sunday)

  return { titre: `Week-end du ${debut} au ${fin}` }
}

export default async function InscriptionsPage() {
  const [inscriptions, matchsAvecManques] = await Promise.all([
    getAllInscriptions(),
    getInscriptionsStats(),
  ])

  // Grouper toutes les données par week-end
  const weekendsData = new Map<
    string,
    {
      friday: Date
      manques: typeof matchsAvecManques
      inscriptions: typeof inscriptions
    }
  >()

  const weekendDe = (date: Date) => {
    const friday = vendrediDe(date)
    const weekendKey = friday.toISOString().split('T')[0]

    if (!weekendsData.has(weekendKey)) {
      weekendsData.set(weekendKey, { friday, manques: [], inscriptions: [] })
    }
    return weekendsData.get(weekendKey)!
  }

  matchsAvecManques.forEach((match) => weekendDe(match.date).manques.push(match))
  inscriptions.forEach((inscription) =>
    weekendDe(inscription.match.date).inscriptions.push(inscription)
  )

  // Trier les week-ends par date et écarter ceux dont le dimanche est passé
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const weekends = Array.from(weekendsData.entries())
    .filter(([, data]) => {
      const sunday = dimancheDe(data.friday)
      sunday.setHours(23, 59, 59, 999)
      return sunday >= now
    })
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([cle, data]) => ({ cle, ...nommerWeekend(data.friday), ...data }))

  const postesAPourvoir = weekends.reduce(
    (somme, weekend) =>
      somme + weekend.manques.reduce((sousTotal, match) => sousTotal + match.totalManques, 0),
    0
  )
  const inscrits = weekends.reduce((somme, weekend) => somme + weekend.inscriptions.length, 0)

  return (
    <div>
      <PageHeader
        title="Inscriptions"
        description="Les bénévoles des matchs à domicile, semaine après semaine : table de marque, arbitrage, responsable de salle et buvette."
      />

      <Tabs defaultValue="postes">
        <TabsList aria-label="Postes à pourvoir ou bénévoles inscrits">
          <TabsTrigger value="postes" count={postesAPourvoir}>
            À pourvoir
          </TabsTrigger>
          <TabsTrigger value="inscrits" count={inscrits}>
            Inscrits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="postes">
          <ManquesResume
            weekends={weekends
              .filter((weekend) => weekend.manques.length > 0)
              .map(({ cle, titre, periode, manques, inscriptions: inscritsDuWeekend }) => ({
                cle,
                titre,
                periode,
                matchs: manques,
                inscrits: inscritsDuWeekend.length,
              }))}
          />
        </TabsContent>

        <TabsContent value="inscrits">
          <InscriptionsTable
            weekends={weekends
              .filter((weekend) => weekend.inscriptions.length > 0)
              .map(({ cle, titre, periode, inscriptions: inscritsDuWeekend }) => ({
                cle,
                titre,
                periode,
                inscriptions: inscritsDuWeekend,
              }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
