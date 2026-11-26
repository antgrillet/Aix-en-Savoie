/* eslint-disable @next/next/no-img-element -- rendu Satori : <img> est le seul élément image possible */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { COULEURS_GAME_DAY, type CouleurGameDay, type Cote, type Gabarit, type GameDay, type LigneVisuel, type PageVisuel } from './composition'
import { corpsAjuste, creerMesure, type Mesure } from './mesure'

/* --------------------------------------------------------------------------
 * Dimensions relevées sur les visuels publiés (1080 × 1350, Instagram 4:5).
 * Les fonds viennent de public/visuels/fonds : remplacer un fichier par
 * l'export Canva sans les textes variables suffit à le rendre exact.
 * ------------------------------------------------------------------------ */

export const LARGEUR = 1080
export const HAUTEUR = 1350

interface Disposition {
  /** Centre de la pastille de la première ligne */
  cx: number
  cy: number
  diametre: number
  /** Début du texte (code d'équipe) */
  texteX: number
  /** Écart vertical entre deux lignes */
  pas: number
  /** Décalage horizontal de la colonne de droite */
  colonne: number
}

const DISPOSITIONS: Record<Gabarit, Record<Cote, Disposition>> = {
  planning: {
    domicile: { cx: 165, cy: 445, diametre: 97, texteX: 240, pas: 150, colonne: 465 },
    exterieur: { cx: 151, cy: 390, diametre: 104, texteX: 225, pas: 159, colonne: 488 },
  },
  resultat: {
    domicile: { cx: 165, cy: 445, diametre: 97, texteX: 240, pas: 150, colonne: 465 },
    exterieur: { cx: 142, cy: 383, diametre: 104, texteX: 216, pas: 145, colonne: 483 },
  },
}

const COULEURS = {
  domicile: { texte: '#000000', ligne: '#1a1a1a', neutre: '#585858' },
  exterieur: { texte: '#ffffff', ligne: '#ffffff', neutre: '#8c8c8c' },
  victoire: '#1fa335',
  defaite: '#e1242c',
}

/* --------------------------------------------------------------------------
 * Ressources : polices, fonds, logos
 * ------------------------------------------------------------------------ */

type Police = { name: string; data: ArrayBuffer; weight: 300 | 400 | 700; style: 'normal' }

/**
 * Polices embarquées dans le dépôt (TrueType de Google Fonts, licence OFL) : Anton, Open Sans 300, 400
 * et 700, et Open Sans 700 en largeur 87,5 (« Open Sans Condensed », bandeau « WEEKEND DU … »).
 * Aucun appel réseau au rendu.
 */
const DOSSIER_POLICES = path.join(process.cwd(), 'src', 'lib', 'visuels', 'polices')

interface Polices {
  fonts: Police[]
  /** Largeurs en em, pour réduire un texte variable avant qu'il ne déborde */
  anton: Mesure
  openSans: Mesure
  openSansGras: Mesure
  openSansLeger: Mesure
}

async function police(fichierTtf: string): Promise<ArrayBuffer> {
  const octets = await readFile(path.join(DOSSIER_POLICES, fichierTtf))
  return octets.buffer.slice(octets.byteOffset, octets.byteOffset + octets.byteLength) as ArrayBuffer
}

let polices: Promise<Polices> | null = null
function chargerPolices(): Promise<Polices> {
  polices ??= Promise.all([
    police('Anton-400.ttf'),
    police('OpenSans-300.ttf'),
    police('OpenSans-400.ttf'),
    police('OpenSans-700.ttf'),
    police('OpenSansCondensed-700.ttf'),
  ])
    .then(([anton, leger, normal, gras, condense]): Polices => ({
      fonts: [
        { name: 'Anton', data: anton, weight: 400, style: 'normal' },
        { name: 'Open Sans', data: leger, weight: 300, style: 'normal' },
        { name: 'Open Sans', data: normal, weight: 400, style: 'normal' },
        { name: 'Open Sans', data: gras, weight: 700, style: 'normal' },
        { name: 'Open Sans Condensed', data: condense, weight: 700, style: 'normal' },
      ],
      anton: creerMesure(anton),
      openSans: creerMesure(normal),
      openSansGras: creerMesure(gras),
      openSansLeger: creerMesure(leger),
    }))
    .catch((erreur) => {
      polices = null
      throw erreur
    })
  return polices
}

// Dossiers écrits en entier : le traçage de la fonction n'embarque qu'eux, pas tout public/
const DOSSIER_VISUELS = path.join(process.cwd(), 'public', 'visuels')
/** Seules les images de public/img peuvent servir de photo d'équipe locale */
const DOSSIER_PHOTOS = path.join(process.cwd(), 'public', 'img')

async function fichier(chemin: string): Promise<string> {
  const octets = await readFile(path.join(DOSSIER_VISUELS, chemin))
  const type = chemin.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${type};base64,${octets.toString('base64')}`
}

const fond = (nom: string) => fichier(`fonds/${nom}.jpg`)

/** Taille maximale d'une image téléchargée (logo ou photo) */
const OCTETS_MAX = 15 * 1024 * 1024
/** Garde-fou de sharp contre les images démesurées (décompression) */
const PIXELS_MAX = 50_000_000

/** Corps de la réponse, refusé au-delà de `OCTETS_MAX` (en-tête annoncé ou octets reçus). */
async function lireBorne(reponse: Response): Promise<Buffer | null> {
  if (Number(reponse.headers.get('content-length') ?? 0) > OCTETS_MAX || !reponse.body) return null
  const morceaux: Uint8Array[] = []
  let total = 0
  const lecteur = reponse.body.getReader()
  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    total += value.byteLength
    if (total > OCTETS_MAX) {
      await lecteur.cancel()
      return null
    }
    morceaux.push(value)
  }
  return Buffer.concat(morceaux)
}

/** Seuls les logos de la fédération sont chargés (adresses venues de la base). */
const HOTE_LOGOS = 'media-logos-clubs.ffhandball.fr'
const logos = new Map<string, Promise<string | null>>()

async function telechargerLogo(url: string): Promise<string | null> {
  try {
    const adresse = new URL(url)
    if (adresse.protocol !== 'https:' || adresse.hostname !== HOTE_LOGOS) return null
    const reponse = await fetch(adresse, { cache: 'force-cache', redirect: 'error', signal: AbortSignal.timeout(8000) })
    if (!reponse.ok) return null
    const octets = await lireBorne(reponse)
    if (!octets) return null
    // Satori ne lit pas le WebP : conversion en PNG, fond transparent conservé
    const png = await sharp(octets, { limitInputPixels: PIXELS_MAX }).trim().resize(256, 256, { fit: 'inside' }).png().toBuffer()
    return `data:image/png;base64,${png.toString('base64')}`
  } catch {
    return null
  }
}

/** Logo en 512 px, sinon l'adresse d'origine en 64 px (la variante 512 n'existe pas toujours). */
function logo(url: string): Promise<string | null> {
  let enCours = logos.get(url)
  if (!enCours) {
    const origine = url.replace('/512/', '/64/')
    enCours = telechargerLogo(url).then((png) => png ?? (origine !== url ? telechargerLogo(origine) : null))
    // Un échec ne reste pas en cache : le prochain rendu réessaie
    void enCours.then((png) => {
      if (png === null) logos.delete(url)
    })
    logos.set(url, enCours)
  }
  return enCours
}

/* --------------------------------------------------------------------------
 * Éléments
 * ------------------------------------------------------------------------ */

function Coche({ couleur, taille }: { couleur: string; taille: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24">
      <path d="M3 13.2 L9 19 L21.5 5.5" fill="none" stroke={couleur} strokeWidth="3.6" strokeLinecap="square" />
    </svg>
  )
}

function Croix({ couleur, taille }: { couleur: string; taille: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24">
      <path d="M4 3 L20 21 M20 3 L4 21" fill="none" stroke={couleur} strokeWidth="3.4" strokeLinecap="square" />
    </svg>
  )
}

function Pastille({ src, diametre, x, y }: { src: string | null; diametre: number; x: number; y: number }) {
  const interieur = Math.round(diametre * 0.86)
  return (
    <div
      style={{
        position: 'absolute',
        left: x - diametre / 2,
        top: y - diametre / 2,
        width: diametre,
        height: diametre,
        borderRadius: diametre,
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {src && <img alt="" src={src} width={interieur} height={interieur} style={{ objectFit: 'contain' }} />}
    </div>
  )
}

interface LigneRendue extends LigneVisuel {
  images: (string | null)[]
}

/** Largeur laissée au code d'équipe : jusqu'à la pastille de la colonne de droite, ou au bord du visuel */
function largeurCode(d: Disposition): number {
  return Math.min(d.colonne - (d.texteX - d.cx) - d.diametre / 2 - 14, LARGEUR - (d.texteX + d.colonne) - 30)
}

function Ligne({
  ligne,
  gabarit,
  cote,
  d,
  x,
  y,
  mesure,
}: {
  ligne: LigneRendue
  gabarit: Gabarit
  cote: Cote
  d: Disposition
  x: number
  y: number
  mesure: Mesure
}) {
  const couleurs = COULEURS[cote]
  const corpsCode = cote === 'domicile' ? 45 : 41
  const largeurMax = largeurCode(d)
  // Un code inhabituel (nom d'équipe non reconnu) est réduit, posé sur la même ligne de pied
  const corps = corpsAjuste(mesure(ligne.code), corpsCode, largeurMax, 22)
  const images = ligne.images.length > 0 ? ligne.images.slice(0, 2) : [null]
  const texteX = x + (d.texteX - d.cx)
  const r = ligne.resultat
  const couleurScore = !r ? couleurs.neutre : r.plateau || r.signe === 'nul' ? couleurs.neutre : COULEURS[r.signe]

  return (
    <>
      {images.map((src, i) => (
        <Pastille key={i} src={src} diametre={d.diametre} x={images.length > 1 ? x + (i === 0 ? -22 : 22) : x} y={y} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: texteX,
          top: y - 41.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Anton',
            fontSize: corps,
            lineHeight: 1,
            color: couleurs.texte,
            height: 51,
            paddingTop: corpsCode - corps,
            maxWidth: largeurMax,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {ligne.code}
        </div>
        {gabarit === 'planning' || !r ? (
          <div style={{ fontFamily: 'Open Sans', fontSize: 31, lineHeight: 1, color: couleurs.ligne }}>{ligne.horaire}</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Open Sans', fontSize: 31, lineHeight: 1, color: couleurScore }}>
            {r.plateau || r.signe === 'nul' ? (
              <span style={{ fontWeight: 700, width: 30 }}>=</span>
            ) : r.signe === 'victoire' ? (
              <Coche couleur={couleurScore} taille={30} />
            ) : (
              <Croix couleur={couleurScore} taille={30} />
            )}
            {r.gauche ? (
              <>
                <span style={{ marginLeft: 16, fontWeight: r.gras === 'gauche' ? 700 : 400 }}>{r.gauche}</span>
                <span style={{ margin: '0 10px' }}>-</span>
                <span style={{ fontWeight: r.gras === 'droite' ? 700 : 400 }}>{r.droite}</span>
              </>
            ) : (
              <span style={{ marginLeft: 16 }}>PLATEAU</span>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Cadre({ fondSrc, children }: { fondSrc: string; children: React.ReactNode }) {
  return (
    <div style={{ width: LARGEUR, height: HAUTEUR, display: 'flex', position: 'relative' }}>
      <img alt="" src={fondSrc} width={LARGEUR} height={HAUTEUR} style={{ position: 'absolute', left: 0, top: 0 }} />
      {children}
    </div>
  )
}

function Bandeau({ texte, top, centreX, taille, couleur }: { texte: string; top: number; centreX: number; taille: number; couleur: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: centreX - 500,
        width: 1000,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Open Sans Condensed',
        fontWeight: 700,
        fontSize: taille,
        lineHeight: 1,
        color: couleur,
      }}
    >
      {texte}
    </div>
  )
}

/* --------------------------------------------------------------------------
 * Rendu
 * ------------------------------------------------------------------------ */

export type PageDemandee = { type: 'couverture' } | { type: 'liste'; page: PageVisuel }

/**
 * ImageResponse est paresseux : Satori et la rastérisation tournent pendant la lecture du flux.
 * Le PNG est donc produit ici, pour qu'une erreur remonte à l'appelant (500) au lieu d'un 200 vide.
 */
async function rendrePng(element: React.ReactElement, fonts: Police[]): Promise<Response> {
  const octets = await new ImageResponse(element, { width: LARGEUR, height: HAUTEUR, fonts }).arrayBuffer()
  if (octets.byteLength === 0) throw new Error('Rendu vide')
  return new Response(octets, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=60' } })
}

export async function rendreVisuel(gabarit: Gabarit, titre: string, demande: PageDemandee): Promise<Response> {
  const { fonts, anton } = await chargerPolices()

  if (demande.type === 'couverture') {
    const src = await fond(`${gabarit}-couverture`)
    // Planning : date blanche centrée ; Résultat : date noire calée sur « RÉSULTAT »
    const bandeau =
      gabarit === 'planning'
        ? { top: 464, centreX: 540, taille: 33, couleur: '#ffffff' }
        : { top: 484, centreX: 604, taille: 33, couleur: '#000000' }
    return rendrePng(
      <Cadre fondSrc={src}>
        <Bandeau texte={titre} {...bandeau} />
      </Cadre>,
      fonts
    )
  }

  const { page } = demande
  const d = DISPOSITIONS[gabarit][page.cote]
  const [src, colonnes] = await Promise.all([
    fond(`${gabarit}-${page.cote}`),
    Promise.all(
      page.colonnes.map((colonne) =>
        Promise.all(
          colonne.map(async (ligne): Promise<LigneRendue> => ({ ...ligne, images: await Promise.all(ligne.logos.slice(0, 2).map(logo)) }))
        )
      )
    ),
  ])

  return rendrePng(
    <Cadre fondSrc={src}>
      <Bandeau texte={titre} top={89} centreX={540} taille={27} couleur={COULEURS[page.cote].texte} />
      {colonnes.flatMap((colonne, c) =>
        colonne.map((ligne, i) => (
          <Ligne
            key={ligne.cle}
            ligne={ligne}
            gabarit={gabarit}
            cote={page.cote}
            d={d}
            x={d.cx + c * d.colonne}
            y={d.cy + i * d.pas}
            mesure={anton}
          />
        ))
      )}
    </Cadre>,
    fonts
  )
}

/* --------------------------------------------------------------------------
 * Game Day : photo de l'équipe, titre GAME + « Day » manuscrit à la couleur
 * choisie, les deux clubs, la date et l'heure.
 * ------------------------------------------------------------------------ */

/**
 * Photo de l'affiche, recadrée en 1080 × 1350 : image de public/img, ou Vercel Blob.
 * La photo déposée par l'admin est déjà restreinte par l'API au dossier gameday/ du magasin du site.
 */
async function photo(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    let octets: Buffer | null
    if (url.startsWith('/') && !url.startsWith('//')) {
      // Chemin borné à public/img (le traçage de la fonction n'embarque que ce dossier)
      if (!url.startsWith('/img/')) return null
      const chemin = path.normalize(path.join(DOSSIER_PHOTOS, url.slice('/img/'.length)))
      if (!chemin.startsWith(DOSSIER_PHOTOS + path.sep) || !/\.(jpe?g|png|webp|avif)$/i.test(chemin)) return null
      octets = await readFile(chemin)
      if (octets.byteLength > OCTETS_MAX) return null
    } else {
      const adresse = new URL(url)
      if (adresse.protocol !== 'https:' || !adresse.hostname.endsWith('.public.blob.vercel-storage.com')) return null
      const reponse = await fetch(adresse, { redirect: 'error', signal: AbortSignal.timeout(10000) })
      if (!reponse.ok) return null
      octets = await lireBorne(reponse)
      if (!octets) return null
    }
    const jpeg = await sharp(octets, { limitInputPixels: PIXELS_MAX })
      .rotate()
      .resize(LARGEUR, HAUTEUR, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 86 })
      .toBuffer()
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`
  } catch {
    return null
  }
}

/** « Day » : calque blanc détouré, recoloré à la couleur d'accent */
async function day(couleur: string): Promise<string> {
  const calque = await readFile(path.join(DOSSIER_VISUELS, 'game-day.png'))
  const { width, height } = await sharp(calque).metadata()
  const alpha = await sharp(calque).extractChannel(3).toBuffer()
  const png = await sharp({ create: { width: width!, height: height!, channels: 3, background: couleur } })
    .joinChannel(alpha)
    .png()
    .toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

async function logoClub(): Promise<string> {
  const png = await sharp(await readFile(path.join(DOSSIER_PHOTOS, 'home', 'logo.png'))).resize(300, 300, { fit: 'inside' }).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

function Texte({ top, taille, famille = 'Open Sans', graisse = 400, couleur = '#ffffff', espacement, largeurMax, children }: {
  top: number
  taille: number
  famille?: string
  graisse?: number
  couleur?: string
  espacement?: number
  /** Largeur du texte au-delà de laquelle il est coupé (il est réduit avant, voir `corpsAjuste`) */
  largeurMax?: number
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        width: LARGEUR,
        display: 'flex',
        justifyContent: 'center',
        fontFamily: famille,
        fontWeight: graisse,
        fontSize: taille,
        lineHeight: 1,
        color: couleur,
        ...(espacement ? { letterSpacing: espacement } : {}),
      }}
    >
      {largeurMax ? <div style={{ display: 'flex', maxWidth: largeurMax, overflow: 'hidden', whiteSpace: 'nowrap' }}>{children}</div> : children}
    </div>
  )
}

/** Centres des deux clubs ; le nom reste entre le bord du visuel et l'heure */
const CLUB_GAUCHE = 196
const CLUB_DROITE = 885
const LARGEUR_NOM_CLUB = 340
/** Haut des noms des clubs et de la ligne de la salle */
const HAUT_NOM_CLUB = 1137
const HAUT_SALLE = 1164

/** Corps du nom d'un club : 50, 40 au-delà de onze lettres, moins encore s'il dépasse sa largeur */
function corpsNom(nom: string, anton: Mesure): number {
  return corpsAjuste(anton(nom), nom.length > 11 ? 40 : 50, LARGEUR_NOM_CLUB, 24)
}

function Equipe({ cx, nom, logo, corps }: { cx: number; nom: string; logo: string | null; corps: number }) {
  const diametre = 175
  return (
    <>
      <Pastille src={logo} diametre={diametre} x={cx} y={1045} />
      <div
        style={{
          position: 'absolute',
          top: HAUT_NOM_CLUB,
          left: cx - 200,
          width: 400,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: 'Anton',
          fontSize: corps,
          lineHeight: 1,
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', maxWidth: LARGEUR_NOM_CLUB, overflow: 'hidden', whiteSpace: 'nowrap' }}>{nom}</div>
      </div>
    </>
  )
}

export async function rendreGameDay(gd: GameDay, couleur: CouleurGameDay, photoUrl: string | null): Promise<Response> {
  const accent = COULEURS_GAME_DAY[couleur]
  const [polices, fondPhoto, daySrc, savoie, aix, club, logoGauche, logoDroite] = await Promise.all([
    chargerPolices(),
    photo(photoUrl),
    day(accent),
    fichier('logo-savoie.png'),
    fichier('logo-aix.png'),
    logoClub(),
    gd.gauche.club ? null : gd.gauche.logo ? logo(gd.gauche.logo) : null,
    gd.droite.club ? null : gd.droite.logo ? logo(gd.droite.logo) : null,
  ])
  const { fonts, anton, openSans, openSansLeger } = polices

  // Noms des clubs, puis la salle : quand un nom descend jusqu'à sa ligne, elle tient entre les deux
  const corpsGauche = corpsNom(gd.gauche.nom, anton)
  const corpsDroite = corpsNom(gd.droite.nom, anton)
  const demiNom = (nom: string, corps: number) => (HAUT_NOM_CLUB + corps > HAUT_SALLE ? Math.min(LARGEUR_NOM_CLUB, anton(nom) * corps) / 2 : 0)
  const finNomGauche = CLUB_GAUCHE + demiNom(gd.gauche.nom, corpsGauche)
  const debutNomDroite = CLUB_DROITE - demiNom(gd.droite.nom, corpsDroite)
  const largeurSalle = Math.min(LARGEUR - 80, 2 * Math.min(LARGEUR / 2 - finNomGauche, debutNomDroite - LARGEUR / 2) - 32)
  const corpsSalle = corpsAjuste(openSans(gd.salle), 22, largeurSalle, 13)
  const largeurLigne = LARGEUR - 80
  const corpsInfo = corpsAjuste(openSans(gd.info), 22, largeurLigne, 14)
  // Compétition : entre les deux logos du haut
  const largeurCompetition = 2 * (LARGEUR / 2 - 218) - 32
  const corpsCompetition = corpsAjuste(openSansLeger(gd.competition), 24, largeurCompetition, 14)

  return rendrePng(
    (
      <div style={{ width: LARGEUR, height: HAUTEUR, display: 'flex', position: 'relative', background: '#1b1b1b' }}>
        {fondPhoto && <img alt="" src={fondPhoto} width={LARGEUR} height={HAUTEUR} style={{ position: 'absolute', left: 0, top: 0 }} />}
        {/* Assombrissement : plus fort en haut (titre) et en bas (date, clubs) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: LARGEUR,
            height: HAUTEUR,
            display: 'flex',
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 24%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.38) 64%, rgba(0,0,0,0.72) 100%)',
          }}
        />
        <img alt="" src={savoie} width={116} height={96} style={{ position: 'absolute', left: 102, top: 105 }} />
        <img alt="" src={aix} width={74} height={97} style={{ position: 'absolute', left: 887, top: 99 }} />
        {gd.competition && (
          <Texte top={89} taille={corpsCompetition} graisse={300} largeurMax={largeurCompetition}>
            {gd.competition}
          </Texte>
        )}
        <Texte top={112} taille={210} famille="Anton">
          GAME
        </Texte>
        <img alt="" src={daySrc} width={420} height={250} style={{ position: 'absolute', left: 340, top: 190 }} />
        <Equipe cx={CLUB_GAUCHE} nom={gd.gauche.nom} logo={gd.gauche.club ? club : logoGauche} corps={corpsGauche} />
        <Equipe cx={CLUB_DROITE} nom={gd.droite.nom} logo={gd.droite.club ? club : logoDroite} corps={corpsDroite} />
        <Texte top={956} taille={38}>
          {gd.jour[0]}
        </Texte>
        <Texte top={993} taille={38}>
          {gd.jour[1]}
        </Texte>
        <Texte top={1036} taille={121} famille="Anton" couleur={accent}>
          {gd.heure}
        </Texte>
        <Texte top={HAUT_SALLE + (22 - corpsSalle)} taille={corpsSalle} largeurMax={largeurSalle}>
          {gd.salle}
        </Texte>
        {gd.info ? (
          <Texte top={1193 + (22 - corpsInfo)} taille={corpsInfo} largeurMax={largeurLigne}>
            {gd.info}
          </Texte>
        ) : null}
        <Texte top={1243} taille={21} couleur="rgba(255,255,255,0.5)" espacement={6}>
          ORANGE ET NOIR, POUR LA VICTOIRE
        </Texte>
      </div>
    ),
    fonts
  )
}
