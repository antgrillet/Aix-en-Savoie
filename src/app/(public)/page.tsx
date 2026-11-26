import { prisma } from '@/lib/prisma'
import { getHeroBackgroundImage } from '@/lib/settings'
import { bornesWeekend, formatHeure, FUSEAU_CLUB } from '@/lib/dates'
import { filtreDateSaison } from '@/lib/saisons'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { jourParis, libelleLieu } from '@/lib/resultats-weekend'
import { codeEquipe, libelleCompetition, nomCourt } from '@/lib/visuels/composition'
import { anton, scriptAffiche } from '@/lib/polices-affiche'
import { HeroWelcome } from '@/components/home/HeroWelcome'
import { FeaturedNews } from '@/components/home/FeaturedNews'
import { EncartsMatchs, type CampEncart, type EncartProchain, type EncartResultat } from '@/components/home/EncartsMatchs'
import { PlanningDomicile, type JourDomicile } from '@/components/home/PlanningDomicile'
import { ResultatsDefilants, type CarteResultat } from '@/components/home/ResultatsDefilants'
import { FeaturedPartners } from '@/components/home/FeaturedPartners'
import { NousTrouver } from '@/components/home/NousTrouver'
import { ADRESSE_CLUB, getLieuDomicile, lienItineraire } from '@/lib/lieu-domicile'
import { estNotreClub, issueDe, rangOrdinal } from '@/components/team-page/reperes'
import { OrganizationSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 300

export const metadata = buildMetadata({
  title: 'Accueil',
  description: 'HBC Aix-en-Savoie - Club de handball passionné. Découvrez nos équipes, nos actualités et rejoignez-nous.',
  path: '/',
})

const CLUB: CampEncart = { nom: 'HBCA', logo: '/img/home/logo.png', club: true }

const MOTS_MINUSCULES = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'sur', 'aux', 'au'])

/** « TEAM SALEVE » → « Team Saleve », « VAL DE LEYSSE » → « Val de Leysse » */
function casseNom(nom: string): string {
  return nom
    .toLowerCase()
    .split(/(\s+|-)/)
    .map((mot, i) => (i > 0 && MOTS_MINUSCULES.has(mot) ? mot : mot.charAt(0).toUpperCase() + mot.slice(1)))
    .join('')
}

const heureAffiche = (date: Date) => formatHeure(date).replace(':', 'H')

const formatJourAffiche = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, weekday: 'long', day: 'numeric', month: 'short' })
const formatJourNumero = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, weekday: 'long', day: 'numeric' })
const formatNumero = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, day: 'numeric' })
const formatNumeroMois = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, day: 'numeric', month: 'long' })
const formatMois = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, month: 'long' })

/** « WEEKEND DU 28 – 29 NOVEMBRE » (samedi et dimanche) */
function titreWeekend(dimanche: Date): string {
  const samedi = new Date(dimanche.getTime() - 24 * 60 * 60 * 1000)
  const memeMois = formatMois.format(samedi) === formatMois.format(dimanche)
  const debut = memeMois ? formatNumero.format(samedi) : formatNumeroMois.format(samedi)
  return `Weekend du ${debut} – ${formatNumeroMois.format(dimanche)}`.toUpperCase()
}

/** « SENIORS MASCULINS 1 » → « Seniors M1 » ; les jeunes gardent leur nom (« -18.1M ») */
function nomEquipeCourt(nom: string): string {
  const senior = nom.trim().toUpperCase().match(/^SENIORS?\s+(MASCULIN|FEMININ|FÉMININ)\w*\s*(\d*)$/)
  return senior ? `Seniors ${senior[1].startsWith('M') ? 'M' : 'F'}${senior[2]}` : nom.trim()
}

const MAJUSCULE = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1)

export default async function HomePage() {
  const now = new Date()
  // Week-end à venir (vendredi → dimanche), calculé à l'heure de Paris ;
  // le samedi et le dimanche, on reste sur le week-end en cours.
  const { debut: vendredi, fin: dimanche } = bornesWeekend(now)
  const saison = await getSaisonAffichee()

  const selectMatch = {
    id: true,
    adversaire: true,
    date: true,
    lieu: true,
    domicile: true,
    competition: true,
    scoreEquipe: true,
    scoreAdversaire: true,
    termine: true,
    logoAdversaire: true,
  } as const

  const [featuredArticles, equipes, matchsExterieur, heroBackgroundImage, lieuDomicile] = await Promise.all([
    // Un article à la une et les trois suivants
    prisma.article.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 4,
      select: { id: true, titre: true, categorie: true, date: true, image: true, resume: true, slug: true },
    }),
    // Toutes les équipes publiées, dans l'ordre du club (SM1, SF1, SM2, autres seniors, -18, -15…)
    prisma.equipe.findMany({
      where: { published: true },
      orderBy: { ordre: 'asc' },
      select: {
        id: true,
        nom: true,
        categorie: true,
        genre: true,
        slug: true,
        featured: true,
        classement: { orderBy: { position: 'asc' }, select: { position: true, club: true } },
        // Dernier résultat de la saison affichée
        matchs: {
          where: {
            published: true,
            termine: true,
            date: filtreDateSaison(saison),
            scoreEquipe: { not: null },
            scoreAdversaire: { not: null },
          },
          orderBy: { date: 'desc' },
          take: 1,
          select: selectMatch,
        },
      },
    }),
    prisma.match.count({
      where: { published: true, domicile: false, date: { gte: vendredi, lte: dimanche }, equipe: { published: true } },
    }),
    getHeroBackgroundImage(),
    getLieuDomicile(),
  ])

  const equipeParId = new Map(equipes.map((e) => [e.id, e]))
  const idsPhares = equipes.filter((e) => e.featured).map((e) => e.id)

  const [prochainsPhares, matchsDomicile] = await Promise.all([
    prisma.match.findMany({
      // Matchs à domicile seulement : le hero montre ce qu'on peut venir voir au gymnase
      where: { equipeId: { in: idsPhares }, published: true, termine: false, domicile: true, date: { gte: now } },
      orderBy: { date: 'asc' },
      take: 1,
      select: { ...selectMatch, equipeId: true },
    }),
    prisma.match.findMany({
      where: { published: true, domicile: true, date: { gte: vendredi, lte: dimanche }, equipe: { published: true } },
      orderBy: { date: 'asc' },
      select: { ...selectMatch, equipeId: true },
    }),
  ])

  const rangDe = (equipe: (typeof equipes)[number]) => {
    const notre = equipe.classement.find((l) => estNotreClub(l.club))
    return notre ? { position: rangOrdinal(notre.position), total: equipe.classement.length } : null
  }

  // Dernier résultat de chaque équipe, pour le bandeau qui défile
  const cartesResultats: CarteResultat[] = equipes.flatMap((equipe) => {
    const match = equipe.matchs[0]
    if (!match || match.scoreEquipe === null || match.scoreAdversaire === null) return []
    return [
      {
        id: equipe.id,
        href: `/equipes/${equipe.slug}`,
        equipe: nomEquipeCourt(equipe.nom),
        division: equipe.categorie.trim().toUpperCase(),
        adversaire: casseNom(nomCourt(match.adversaire)),
        domicile: match.domicile,
        scoreEquipe: match.scoreEquipe,
        scoreAdversaire: match.scoreAdversaire,
        issue: issueDe({ ...match, scoreEquipe: match.scoreEquipe, scoreAdversaire: match.scoreAdversaire }),
        rang: rangDe(equipe),
      },
    ]
  })

  // Hero : prochain match à domicile d'une équipe phare, le plus proche dans le temps
  const prochainMatch = prochainsPhares[0]
  let prochain: EncartProchain | null = null
  if (prochainMatch) {
    const equipe = equipeParId.get(prochainMatch.equipeId)
    const adversaire: CampEncart = { nom: nomCourt(prochainMatch.adversaire), logo: prochainMatch.logoAdversaire, club: false }
    prochain = {
      equipe: codeEquipe(equipe?.nom ?? ''),
      href: equipe ? `/equipes/${equipe.slug}` : '/equipes',
      competition: libelleCompetition(prochainMatch.competition) || (equipe?.categorie.trim().toUpperCase() ?? ''),
      exterieur: !prochainMatch.domicile,
      jour: formatJourAffiche.format(prochainMatch.date).toUpperCase(),
      heure: heureAffiche(prochainMatch.date),
      salle: libelleLieu(prochainMatch.lieu, prochainMatch.domicile),
      gauche: prochainMatch.domicile ? CLUB : adversaire,
      droite: prochainMatch.domicile ? adversaire : CLUB,
    }
  }

  // Contexte de l'équipe du prochain match (son dernier résultat et son classement) ;
  // sans match à domicile à venir, la première équipe phare qui a joué
  const carteDernier = prochainMatch
    ? cartesResultats.find((c) => c.id === prochainMatch.equipeId)
    : cartesResultats.find((c) => idsPhares.includes(c.id))
  const dernier: EncartResultat | null = carteDernier
    ? { ...carteDernier, equipe: codeEquipe(equipeParId.get(carteDernier.id)?.nom ?? carteDernier.equipe) }
    : null

  // Hero : matchs à domicile du week-end, hors prochain match déjà affiché
  const domicileHero = matchsDomicile.filter((m) => m.id !== prochainMatch?.id)
  const domicileAffiches = domicileHero.slice(0, 4).map((m) => ({
    id: m.id,
    heure: heureAffiche(m.date),
    equipe: codeEquipe(equipeParId.get(m.equipeId)?.nom ?? ''),
    adversaire: casseNom(nomCourt(m.adversaire)),
  }))

  // Planning domicile, groupé par jour
  const jours: JourDomicile[] = []
  for (const match of matchsDomicile) {
    const equipe = equipeParId.get(match.equipeId)
    if (!equipe) continue
    const cle = jourParis(match.date)
    let jour = jours.find((j) => j.cle === cle)
    if (!jour) {
      jour = { cle, libelle: MAJUSCULE(formatJourNumero.format(match.date)), lignes: [] }
      jours.push(jour)
    }
    jour.lignes.push({
      id: match.id,
      heure: heureAffiche(match.date),
      equipe: equipe.nom,
      categorie: equipe.categorie,
      adversaire: casseNom(nomCourt(match.adversaire)),
      featured: equipe.featured,
      genre: equipe.genre,
    })
  }
  const salles = new Set(matchsDomicile.map((m) => libelleLieu(m.lieu, true)))
  const salleUnique = salles.size === 1 ? [...salles][0] : null

  // Partenaires : majeurs d'abord, sinon les partenaires publiés
  const partenairesQuery = (majeurs: boolean) =>
    prisma.partenaire.findMany({
      where: majeurs ? { published: true, partenaire_majeur: true } : { published: true },
      orderBy: { ordre: 'asc' },
      take: 12,
      select: { id: true, nom: true, logo: true, site: true, partenaire_majeur: true },
    })
  let featuredPartenaires = await partenairesQuery(true)
  if (featuredPartenaires.length === 0) {
    featuredPartenaires = await partenairesQuery(false)
  }

  return (
    // Les titres gardent la police d'origine de la page d'accueil (Montserrat) ;
    // Anton et l'écriture manuscrite viennent des affiches du club
    <div
      className={`${anton.variable} ${scriptAffiche.variable}`}
      style={{ ['--font-display' as string]: "var(--font-montserrat), 'Inter', sans-serif" }}
    >
      <OrganizationSchema />

      <HeroWelcome backgroundImage={heroBackgroundImage}>
        <EncartsMatchs
          prochain={prochain}
          dernier={dernier}
          domicile={domicileAffiches}
          autresDomicile={domicileHero.length - domicileAffiches.length}
        />
      </HeroWelcome>

      {featuredArticles.length > 0 && <FeaturedNews articles={featuredArticles} />}

      <PlanningDomicile
        titreWeekend={titreWeekend(dimanche)}
        jours={jours}
        salle={salleUnique}
        matchsExterieur={matchsExterieur}
      />

      <ResultatsDefilants cartes={cartesResultats} />

      {featuredPartenaires.length > 0 && <FeaturedPartners partenaires={featuredPartenaires} />}

      {/* Gymnase, secrétariat et inscription */}
      <NousTrouver lieu={lieuDomicile} itineraire={lienItineraire(lieuDomicile ?? ADRESSE_CLUB)} />
    </div>
  )
}
