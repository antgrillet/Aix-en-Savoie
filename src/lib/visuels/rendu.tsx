/* eslint-disable @next/next/no-img-element -- rendu Satori : <img> est le seul élément image possible */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { COULEURS_GAME_DAY, type CouleurGameDay, type Cote, type Gabarit, type GameDay, type LigneVisuel, type PageVisuel } from './composition'

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

/** Google Fonts renvoie du TrueType quand la requête n'annonce aucun navigateur. */
async function policeGoogle(famille: string, graisse: 300 | 400 | 700, largeur?: number): Promise<ArrayBuffer> {
  const axes = largeur ? `wdth,wght@${largeur},${graisse}` : `wght@${graisse}`
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${famille.replace(/ /g, '+')}:${axes}`, {
    cache: 'force-cache',
  }).then((r) => r.text())
  const url = css.match(/src: url\((https:[^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1]
  if (!url) throw new Error(`Police introuvable : ${famille} ${graisse}`)
  return fetch(url, { cache: 'force-cache' }).then((r) => r.arrayBuffer())
}

let polices: Promise<Police[]> | null = null
function chargerPolices(): Promise<Police[]> {
  polices ??= Promise.all([
    policeGoogle('Anton', 400).then((data): Police => ({ name: 'Anton', data, weight: 400, style: 'normal' })),
    policeGoogle('Open Sans', 300).then((data): Police => ({ name: 'Open Sans', data, weight: 300, style: 'normal' })),
    policeGoogle('Open Sans', 400).then((data): Police => ({ name: 'Open Sans', data, weight: 400, style: 'normal' })),
    policeGoogle('Open Sans', 700).then((data): Police => ({ name: 'Open Sans', data, weight: 700, style: 'normal' })),
    // Bandeau « WEEKEND DU … » : Open Sans semi-condensé
    policeGoogle('Open Sans', 700, 87.5).then((data): Police => ({ name: 'Open Sans Condensed', data, weight: 700, style: 'normal' })),
  ]).catch((erreur) => {
    polices = null
    throw erreur
  })
  return polices
}

const PUBLIC = path.join(process.cwd(), 'public')
const DOSSIER_VISUELS = path.join(PUBLIC, 'visuels')

async function fichier(chemin: string): Promise<string> {
  const octets = await readFile(path.join(DOSSIER_VISUELS, chemin))
  const type = chemin.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${type};base64,${octets.toString('base64')}`
}

const fond = (nom: string) => fichier(`fonds/${nom}.jpg`)

/** Seuls les logos de la fédération sont chargés (adresses venues de la base). */
const HOTE_LOGOS = 'media-logos-clubs.ffhandball.fr'
const logos = new Map<string, Promise<string | null>>()

function logo(url: string): Promise<string | null> {
  let enCours = logos.get(url)
  if (!enCours) {
    enCours = (async () => {
      try {
        const adresse = new URL(url)
        if (adresse.protocol !== 'https:' || adresse.hostname !== HOTE_LOGOS) return null
        const reponse = await fetch(adresse, { cache: 'force-cache', signal: AbortSignal.timeout(8000) })
        if (!reponse.ok) return null
        // Satori ne lit pas le WebP : conversion en PNG, fond transparent conservé
        const png = await sharp(Buffer.from(await reponse.arrayBuffer())).trim().resize(256, 256, { fit: 'inside' }).png().toBuffer()
        return `data:image/png;base64,${png.toString('base64')}`
      } catch {
        return null
      }
    })()
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

function Ligne({
  ligne,
  gabarit,
  cote,
  d,
  x,
  y,
}: {
  ligne: LigneRendue
  gabarit: Gabarit
  cote: Cote
  d: Disposition
  x: number
  y: number
}) {
  const couleurs = COULEURS[cote]
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
        <div style={{ fontFamily: 'Anton', fontSize: cote === 'domicile' ? 45 : 41, lineHeight: 1, color: couleurs.texte, height: 51 }}>{ligne.code}</div>
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

export async function rendreVisuel(gabarit: Gabarit, titre: string, demande: PageDemandee): Promise<ImageResponse> {
  const fonts = await chargerPolices()
  const options = { width: LARGEUR, height: HAUTEUR, fonts, headers: { 'Cache-Control': 'private, no-store' } }

  if (demande.type === 'couverture') {
    const src = await fond(`${gabarit}-couverture`)
    // Planning : date blanche centrée ; Résultat : date noire calée sur « RÉSULTAT »
    const bandeau =
      gabarit === 'planning'
        ? { top: 464, centreX: 540, taille: 33, couleur: '#ffffff' }
        : { top: 484, centreX: 604, taille: 33, couleur: '#000000' }
    return new ImageResponse(
      (
        <Cadre fondSrc={src}>
          <Bandeau texte={titre} {...bandeau} />
        </Cadre>
      ),
      options
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

  return new ImageResponse(
    (
      <Cadre fondSrc={src}>
        <Bandeau texte={titre} top={89} centreX={540} taille={27} couleur={COULEURS[page.cote].texte} />
        {colonnes.flatMap((colonne, c) =>
          colonne.map((ligne, i) => (
            <Ligne key={ligne.cle} ligne={ligne} gabarit={gabarit} cote={page.cote} d={d} x={d.cx + c * d.colonne} y={d.cy + i * d.pas} />
          ))
        )}
      </Cadre>
    ),
    options
  )
}

/* --------------------------------------------------------------------------
 * Game Day : photo de l'équipe, titre GAME + « Day » manuscrit à la couleur
 * choisie, les deux clubs, la date et l'heure.
 * ------------------------------------------------------------------------ */

/** Photo d'équipe : fichier de public/ ou Vercel Blob du site, recadrée en 1080 × 1350 */
async function photo(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    let octets: Buffer
    if (url.startsWith('/') && !url.startsWith('//')) {
      const chemin = path.normalize(path.join(PUBLIC, url))
      if (!chemin.startsWith(PUBLIC + path.sep)) return null
      octets = await readFile(chemin)
    } else {
      const adresse = new URL(url)
      if (adresse.protocol !== 'https:' || !adresse.hostname.endsWith('.public.blob.vercel-storage.com')) return null
      const reponse = await fetch(adresse, { signal: AbortSignal.timeout(10000) })
      if (!reponse.ok) return null
      octets = Buffer.from(await reponse.arrayBuffer())
    }
    const jpeg = await sharp(octets).rotate().resize(LARGEUR, HAUTEUR, { fit: 'cover', position: 'attention' }).jpeg({ quality: 86 }).toBuffer()
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
  const png = await sharp(await readFile(path.join(PUBLIC, 'img', 'home', 'logo.png'))).resize(300, 300, { fit: 'inside' }).png().toBuffer()
  return `data:image/png;base64,${png.toString('base64')}`
}

function Texte({ top, taille, famille = 'Open Sans', graisse = 400, couleur = '#ffffff', espacement, children }: {
  top: number
  taille: number
  famille?: string
  graisse?: number
  couleur?: string
  espacement?: number
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
      {children}
    </div>
  )
}

function Equipe({ cx, nom, logo }: { cx: number; nom: string; logo: string | null }) {
  const diametre = 175
  return (
    <>
      <Pastille src={logo} diametre={diametre} x={cx} y={1045} />
      <div
        style={{
          position: 'absolute',
          top: 1137,
          left: cx - 200,
          width: 400,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: 'Anton',
          fontSize: nom.length > 11 ? 40 : 50,
          lineHeight: 1,
          color: '#ffffff',
        }}
      >
        {nom}
      </div>
    </>
  )
}

export async function rendreGameDay(gd: GameDay, couleur: CouleurGameDay, photoUrl: string | null): Promise<ImageResponse> {
  const accent = COULEURS_GAME_DAY[couleur]
  const [fonts, fondPhoto, daySrc, savoie, aix, club, logoGauche, logoDroite] = await Promise.all([
    chargerPolices(),
    photo(photoUrl),
    day(accent),
    fichier('logo-savoie.png'),
    fichier('logo-aix.png'),
    logoClub(),
    gd.gauche.club ? null : gd.gauche.logo ? logo(gd.gauche.logo) : null,
    gd.droite.club ? null : gd.droite.logo ? logo(gd.droite.logo) : null,
  ])

  return new ImageResponse(
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
          <Texte top={89} taille={24} graisse={300}>
            {gd.competition}
          </Texte>
        )}
        <Texte top={112} taille={210} famille="Anton">
          GAME
        </Texte>
        <img alt="" src={daySrc} width={420} height={250} style={{ position: 'absolute', left: 340, top: 190 }} />
        <Equipe cx={196} nom={gd.gauche.nom} logo={gd.gauche.club ? club : logoGauche} />
        <Equipe cx={885} nom={gd.droite.nom} logo={gd.droite.club ? club : logoDroite} />
        <Texte top={956} taille={38}>
          {gd.jour[0]}
        </Texte>
        <Texte top={993} taille={38}>
          {gd.jour[1]}
        </Texte>
        <Texte top={1036} taille={121} famille="Anton" couleur={accent}>
          {gd.heure}
        </Texte>
        <Texte top={1164} taille={22}>
          {gd.salle}
        </Texte>
        {gd.info ? (
          <Texte top={1193} taille={22}>
            {gd.info}
          </Texte>
        ) : null}
        <Texte top={1243} taille={21} couleur="rgba(255,255,255,0.5)" espacement={6}>
          ORANGE ET NOIR, POUR LA VICTOIRE
        </Texte>
      </div>
    ),
    { width: LARGEUR, height: HAUTEUR, fonts, headers: { 'Cache-Control': 'private, no-store' } }
  )
}
