import Link from 'next/link'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/admin/Button'
import { EmptyState } from '@/components/admin/EmptyState'
import { PageHeader } from '@/components/admin/PageHeader'
import { requireAdmin } from '@/lib/auth-utils'
import { ajouterJours, jourParis, lireSemaine } from '@/lib/resultats-weekend'
import {
  COULEURS_GAME_DAY,
  LONGUEUR_INFO,
  LONGUEUR_NOM,
  LONGUEUR_SALLE,
  composerGameDay,
  couleurParDefaut,
  legende,
  lireCouleur,
  photoGameDayAutorisee,
  titreWeekend,
  type CompositionWeekend,
  type Gabarit,
} from '@/lib/visuels/composition'
import { chargerWeekend, idPage, lireGabarit, matchsGameDay } from '@/lib/visuels/donnees'
import { PhotoGameDay } from './PhotoGameDay'

export const dynamic = 'force-dynamic'

type Vue = Gabarit | 'gameday'

const VUES: { id: Vue; libelle: string }[] = [
  { id: 'planning', libelle: 'Planning' },
  { id: 'resultat', libelle: 'Résultat' },
  { id: 'gameday', libelle: 'Game Day' },
]

const formatJour = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', hour: '2-digit', minute: '2-digit' })

export default async function VisuelsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()

  const parametres = await searchParams
  const maintenant = new Date()
  const lundi = lireSemaine(typeof parametres.semaine === 'string' ? parametres.semaine : undefined, maintenant)
  // Dès le dimanche du week-end affiché : les résultats ; avant, le planning
  const gabaritDefaut: Gabarit = jourParis(maintenant) >= ajouterJours(lundi, 6) ? 'resultat' : 'planning'
  const vue: Vue = parametres.gabarit === 'gameday' ? 'gameday' : (lireGabarit(typeof parametres.gabarit === 'string' ? parametres.gabarit : null) ?? gabaritDefaut)
  const titre = titreWeekend(lundi)

  const lien = (semaine: string, g: Vue) => `/admin/visuels?${new URLSearchParams({ semaine, gabarit: g })}`

  return (
    <>
      <PageHeader
        title="Visuels"
        description="Les visuels Instagram du week-end, faits avec les modèles du club et les matchs synchronisés. Vérifiez les scores avant de publier."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Changer de week-end" className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={lien(ajouterJours(lundi, -7), vue)}>
              <ChevronLeft aria-hidden="true" />
              Week-end précédent
            </Link>
          </Button>
          <h2 className="px-1.5 text-[1rem] font-bold">{titre.replace('WEEKEND DU', 'Week-end du').toLowerCase().replace(/^w/, 'W')}</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={lien(ajouterJours(lundi, 7), vue)}>
              Week-end suivant
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </nav>
        <nav aria-label="Choisir le visuel" className="adm-seg self-start">
          {VUES.map((g) => (
            <Link key={g.id} href={lien(lundi, g.id)} aria-current={vue === g.id ? 'page' : undefined}>
              {g.libelle}
            </Link>
          ))}
        </nav>
      </div>

      {vue === 'gameday' ? (
        <GameDays lundi={lundi} parametres={parametres} />
      ) : (
        <Weekend lundi={lundi} gabarit={vue} composition={await chargerWeekend(lundi, vue)} />
      )}
    </>
  )
}

/** Planning ou Résultat : les pages du week-end et le texte de la publication */
function Weekend({ lundi, gabarit, composition }: { lundi: string; gabarit: Gabarit; composition: CompositionWeekend }) {
  const image = (page: string) => `/api/admin/visuels?${new URLSearchParams({ gabarit, semaine: lundi, page })}`
  const pages = composition.pages.length > 0 ? ['couverture', ...composition.pages.map(idPage)] : []
  const nomFichier = (page: string) => `hbca-${gabarit}-${lundi}-${page}.png`
  const libellePage = (page: string) =>
    page === 'couverture' ? 'Couverture' : page.replace('domicile-', 'Domicile ').replace('exterieur-', 'Extérieur ').replace(/ 1$/, '')
  const texte = legende(composition, gabarit)
  const horsWeekend = composition.horsWeekend.length

  return (
    <>
      {horsWeekend > 0 && (
        <div role="status" className="adm-panel mb-4 px-4 py-3 text-[0.9375rem]">
          <p className="font-semibold">
            {horsWeekend} {horsWeekend === 1 ? 'match' : 'matchs'} hors samedi-dimanche non repris : les visuels ne couvrent que le
            samedi et le dimanche.
          </p>
          <ul className="adm-meta mt-1">
            {composition.horsWeekend.map((h) => (
              <li key={h.cle}>
                {h.equipe} ({formatJour.format(h.date)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {gabarit === 'resultat' && composition.sansScore.length > 0 && (
        <div role="status" className="adm-panel mb-4 px-4 py-3 text-[0.9375rem]">
          <p className="font-semibold">
            {composition.sansScore.length === 1 ? 'Un match joué n’a pas de score' : `${composition.sansScore.length} matchs joués n’ont pas de score`} : ils
            n’apparaissent pas sur les visuels.
          </p>
          <ul className="adm-meta mt-1">
            {composition.sansScore.map((s) => (
              <li key={`${s.code}-${s.date.toISOString()}`}>
                {s.code} contre {s.adversaire} ({formatJour.format(s.date)})
              </li>
            ))}
          </ul>
          <Link href={`/admin/resultats?semaine=${lundi}`} className="adm-link mt-2 inline-block font-medium">
            Saisir les scores
          </Link>
        </div>
      )}

      {pages.length === 0 ? (
        <EmptyState title={gabarit === 'resultat' ? 'Aucun résultat sur ce week-end' : 'Aucun match sur ce week-end'}>
          <p>Aucune équipe ne joue ce week-end, ou les matchs ne sont pas encore synchronisés.</p>
        </EmptyState>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pages.map((page) => (
              <li key={page} className="adm-panel flex flex-col gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- image générée, réservée à l'admin */}
                <img
                  src={image(page)}
                  alt={`Visuel ${gabarit === 'planning' ? 'Planning' : 'Résultat'}, ${libellePage(page)}`}
                  width={1080}
                  height={1350}
                  loading="lazy"
                  className="h-auto w-full rounded-md bg-muted"
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{libellePage(page)}</span>
                  <Button asChild variant="outline" size="sm">
                    <a href={image(page)} download={nomFichier(page)}>
                      <Download aria-hidden="true" />
                      Télécharger
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <section className="mt-6" aria-labelledby="legende">
            <h2 id="legende" className="mb-2 text-[1rem] font-bold">
              Texte de la publication
            </h2>
            <textarea
              readOnly
              value={texte}
              rows={Math.min(18, texte.split('\n').length + 1)}
              className="adm-panel w-full resize-y p-3 font-mono text-[0.875rem]"
              aria-label="Texte à copier sous la publication"
            />
          </section>
        </>
      )}
    </>
  )
}

const libelleCouleur: Record<keyof typeof COULEURS_GAME_DAY, string> = { bleu: 'Bleu', orange: 'Orange', rose: 'Rose' }
const formatMatch = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', hour: '2-digit', minute: '2-digit' })

/** Réglages d'une carte dans l'adresse : c<id> couleur, n<id> nom, s<id> salle, i<id> ligne sous la salle, p<id> photo */
const CLE_CARTE = /^([cnsip])(\d+)$/

/**
 * Une affiche par match, déjà remplie depuis la FFHB ; il ne reste qu'à mettre la photo.
 * Chaque carte se règle par un formulaire GET qui garde les réglages des autres cartes.
 */
async function GameDays({ lundi, parametres }: { lundi: string; parametres: Record<string, string | string[] | undefined> }) {
  const matchs = await matchsGameDay(lundi)
  if (matchs.length === 0) {
    return (
      <EmptyState title="Aucun match sur ce week-end">
        <p>Seuls les matchs du samedi et du dimanche ont une affiche Game Day, hors plateaux (-11, -9).</p>
      </EmptyState>
    )
  }
  const valeur = (cle: string) => (typeof parametres[cle] === 'string' ? (parametres[cle] as string) : '')
  // Une ligne d'info vidée exprès se garde aussi : elle retire la ligne par défaut
  const reglages = Object.keys(parametres).filter(
    (cle) => CLE_CARTE.test(cle) && (valeur(cle) !== '' || cle.startsWith('i'))
  )

  return (
    <>
    <p className="adm-meta mb-4 max-w-2xl">
      Tout est rempli depuis la FFHB : adversaire, logos, compétition, date, heure et salle. Il ne reste qu’à mettre la
      photo du match ; sans photo, l’affiche prend celle de l’équipe.
    </p>
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {matchs.map((match) => {
        const couleur = lireCouleur(valeur(`c${match.id}`), couleurParDefaut(match))
        const nom = valeur(`n${match.id}`).slice(0, LONGUEUR_NOM)
        // Salle vide : celle de la FFHB
        const salle = valeur(`s${match.id}`).slice(0, LONGUEUR_SALLE)
        // Champ absent : ligne par défaut (entrée payante en N3 à domicile) ; champ vidé : pas de ligne
        const infoSaisie = typeof parametres[`i${match.id}`] === 'string' ? valeur(`i${match.id}`).slice(0, LONGUEUR_INFO) : undefined
        // Une adresse refusée par l'API n'est pas reprise : l'aperçu garde la photo d'équipe
        const photoBrute = valeur(`p${match.id}`)
        const photoDeposee = photoGameDayAutorisee(photoBrute, process.env.BLOB_READ_WRITE_TOKEN) ? photoBrute : ''
        const affiche = composerGameDay(match, { nomAdversaire: nom, salle, info: infoSaisie })
        const adresse = `/api/admin/visuels?${new URLSearchParams({
          gabarit: 'gameday',
          match: String(match.id),
          couleur,
          ...(nom ? { nom } : {}),
          ...(salle ? { salle } : {}),
          ...(infoSaisie !== undefined ? { info: infoSaisie } : {}),
          ...(photoDeposee ? { photo: photoDeposee } : {}),
        })}`
        const adverse = affiche.gauche.club ? affiche.droite.nom : affiche.gauche.nom
        const autres = reglages.filter((cle) => CLE_CARTE.exec(cle)?.[2] !== String(match.id))
        return (
          <li key={match.id} className="adm-panel flex flex-col gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- image générée, réservée à l'admin */}
            <img
              src={adresse}
              alt={`Game Day ${match.equipe.nom} contre ${adverse}`}
              width={1080}
              height={1350}
              loading="lazy"
              className="h-auto w-full rounded-md bg-muted"
            />
            <div>
              <p className="font-semibold">
                {match.equipe.nom} · {match.domicile ? 'reçoit' : 'chez'} {match.adversaire}
              </p>
              <p className="adm-meta">{formatMatch.format(match.date)}</p>
            </div>
            <form method="get" className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-2">
              <input type="hidden" name="semaine" value={lundi} />
              <input type="hidden" name="gabarit" value="gameday" />
              {autres.map((cle) => (
                <input key={cle} type="hidden" name={cle} value={valeur(cle)} />
              ))}
              <PhotoGameDay nom={`p${match.id}`} valeur={photoDeposee} />
              <label className="flex flex-col gap-1 text-[0.8125rem] font-medium">
                Couleur
                <select name={`c${match.id}`} defaultValue={couleur} className="adm-panel h-9 px-2">
                  {Object.keys(COULEURS_GAME_DAY).map((c) => (
                    <option key={c} value={c}>
                      {libelleCouleur[c as keyof typeof COULEURS_GAME_DAY]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex min-w-0 flex-col gap-1 text-[0.8125rem] font-medium">
                Nom affiché
                <input name={`n${match.id}`} defaultValue={nom || adverse} maxLength={LONGUEUR_NOM} className="adm-panel h-9 px-2" />
              </label>
              <label className="col-span-2 flex min-w-0 flex-col gap-1 text-[0.8125rem] font-medium">
                Salle
                <input
                  name={`s${match.id}`}
                  defaultValue={affiche.salle}
                  maxLength={LONGUEUR_SALLE}
                  className="adm-panel h-9 px-2"
                />
              </label>
              <label className="col-span-2 flex min-w-0 flex-col gap-1 text-[0.8125rem] font-medium">
                Ligne sous la salle
                <input
                  name={`i${match.id}`}
                  defaultValue={affiche.info}
                  maxLength={LONGUEUR_INFO}
                  placeholder="Facultatif, par exemple ENTRÉE PAYANTE : 3€"
                  className="adm-panel h-9 px-2"
                />
              </label>
              <div className="col-span-2 flex flex-wrap gap-2">
              <Button type="submit" variant="outline" size="sm">
                Appliquer
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={adresse} download={`hbca-gameday-${match.id}.png`}>
                  <Download aria-hidden="true" />
                  Télécharger
                </a>
              </Button>
              </div>
            </form>
          </li>
        )
      })}
    </ul>
    </>
  )
}
