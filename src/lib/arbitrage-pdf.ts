import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib'
import {
  formatBareme,
  formatCentimes,
  formatDateMatch,
  formatTaille,
  formaterIban,
  fraisKilometriques,
  referenceNote,
  totalCentimes,
} from '@/lib/arbitrage'

export interface NotePourPdf {
  id: number
  createdAt: Date
  dateMatch: Date
  heureMatch: string
  categorie: string
  equipeLocale: string
  equipeVisiteur: string
  salle: string
  nom: string
  prenom: string
  licence: string
  adresse: string
  telephone: string
  email: string
  titulaireCompte: string | null
  iban: string | null
  bic: string | null
  indemniteCentimes: number
  kilometres: number
  baremeKmCentimes: number
  fraisAnnexesCentimes: number
  totalDemandeCentimes: number
  traiteePar: string | null
  traiteeLe: Date | null
  commentaire: string | null
  signature: Uint8Array | null
  justificatifs: { nom: string; taille: number }[]
}

const A4: [number, number] = [595.28, 841.89]
const MARGE = 48
const LARGEUR = A4[0] - 2 * MARGE

const ORANGE = rgb(0xe8 / 255, 0x73 / 255, 0x1a / 255)
const ENCRE = rgb(0x1f / 255, 0x1e / 255, 0x1b / 255)
const GRIS = rgb(0x5c / 255, 0x58 / 255, 0x52 / 255)
const FILET = rgb(0xe4 / 255, 0xe1 / 255, 0xda / 255)
const FOND = rgb(0xf7 / 255, 0xf5 / 255, 0xf0 / 255)
const VERT = rgb(0x15 / 255, 0x80 / 255, 0x3d / 255)

const formatHorodatage = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'long',
  timeStyle: 'short',
})

/**
 * Les polices standard du PDF ne savent écrire que le jeu WinAnsi. Tout autre
 * caractère (espace fine de Intl, émoji, lettre d'un autre alphabet) est
 * remplacé plutôt que de faire échouer la génération.
 */
function rendreEcrivable(font: PDFFont) {
  const cache = new Map<string, string>()
  const ok = (c: string) => {
    try {
      font.encodeText(c)
      return true
    } catch {
      return false
    }
  }
  return (texte: string) =>
    Array.from(texte.normalize('NFC').replace(/[   ]/g, ' ').replace(/[\r\n\t]+/g, ' '))
      .map((c) => {
        const connu = cache.get(c)
        if (connu !== undefined) return connu
        let rendu = '?'
        if (ok(c)) rendu = c
        else if (/[\u2010-\u2012\u2212]/.test(c)) rendu = '-'
        else if (/[\u2032\u2035]/.test(c)) rendu = "'"
        else if (/\p{Extended_Pictographic}|[\uFE0F\u200D]/u.test(c)) rendu = ''
        else {
          const sansAccent = c.normalize('NFD').replace(/[̀-ͯ]/g, '')
          if (sansAccent && ok(sansAccent)) rendu = sansAccent
        }
        cache.set(c, rendu)
        return rendu
      })
      .join('')
}

/** Le logo du club, s'il est lisible : le PDF s'en passe sinon. */
async function chargerLogo(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const octets = await readFile(path.join(process.cwd(), 'public', 'img', 'home', 'logo.png'))
    return await doc.embedPng(octets)
  } catch {
    return null
  }
}

export async function genererPdfNote(note: NotePourPdf): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const reference = referenceNote(note)
  doc.setTitle(`Note d'arbitrage ${reference}`)
  doc.setAuthor('HBC Aix-en-Savoie')
  doc.setCreator('hbcaixensavoie.fr')
  doc.setLanguage('fr-FR')

  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const gras = await doc.embedFont(StandardFonts.HelveticaBold)
  const ecr = rendreEcrivable(regular)
  const ecrGras = rendreEcrivable(gras)
  const logo = await chargerLogo(doc)

  let page: PDFPage = doc.addPage(A4)
  let y = A4[1] - MARGE

  const nouvellePageSiBesoin = (hauteur: number) => {
    if (y - hauteur < MARGE + 30) {
      page = doc.addPage(A4)
      y = A4[1] - MARGE
    }
  }

  const ecrire = (
    texte: string,
    x: number,
    options: { taille?: number; font?: PDFFont; couleur?: ReturnType<typeof rgb>; yy?: number } = {}
  ) => {
    const font = options.font ?? regular
    page.drawText((font === gras ? ecrGras : ecr)(texte), {
      x,
      y: options.yy ?? y,
      size: options.taille ?? 10,
      font,
      color: options.couleur ?? ENCRE,
    })
  }

  /** Coupe un texte aux mots pour tenir dans une largeur. */
  const couper = (texte: string, largeur: number, font: PDFFont, taille: number): string[] => {
    const propre = (font === gras ? ecrGras : ecr)(texte)
    const lignes: string[] = []
    let ligne = ''
    for (const mot of propre.split(' ')) {
      const essai = ligne ? `${ligne} ${mot}` : mot
      if (font.widthOfTextAtSize(essai, taille) <= largeur) {
        ligne = essai
        continue
      }
      if (ligne) lignes.push(ligne)
      // Un mot plus long que la ligne (adresse e-mail, IBAN) est coupé au caractère
      let reste = mot
      while (font.widthOfTextAtSize(reste, taille) > largeur) {
        let n = reste.length - 1
        while (n > 1 && font.widthOfTextAtSize(reste.slice(0, n), taille) > largeur) n--
        lignes.push(reste.slice(0, n))
        reste = reste.slice(n)
      }
      ligne = reste
    }
    if (ligne) lignes.push(ligne)
    return lignes.length > 0 ? lignes : ['']
  }

  // ------------------------------------------------------------------ En-tête
  const hauteurBandeau = 78
  page.drawRectangle({ x: 0, y: A4[1] - hauteurBandeau, width: A4[0], height: hauteurBandeau, color: ENCRE })
  page.drawRectangle({ x: 0, y: A4[1] - hauteurBandeau - 4, width: A4[0], height: 4, color: ORANGE })
  let xTitre = MARGE
  if (logo) {
    const cote = 54
    page.drawImage(logo, { x: MARGE, y: A4[1] - hauteurBandeau + 12, width: cote, height: cote })
    xTitre = MARGE + cote + 14
  }
  ecrire('HBC Aix-en-Savoie', xTitre, { taille: 18, font: gras, couleur: rgb(1, 1, 1), yy: A4[1] - 36 })
  ecrire("Note d'indemnisation d'arbitrage", xTitre, {
    taille: 11,
    couleur: rgb(0.85, 0.84, 0.81),
    yy: A4[1] - 56,
  })
  const largeurRef = gras.widthOfTextAtSize(reference, 13)
  ecrire(reference, A4[0] - MARGE - largeurRef, { taille: 13, font: gras, couleur: rgb(1, 1, 1), yy: A4[1] - 36 })
  const depot = `Déposée le ${formatHorodatage.format(note.createdAt)}`
  ecrire(depot, A4[0] - MARGE - regular.widthOfTextAtSize(ecr(depot), 9), {
    taille: 9,
    couleur: rgb(0.85, 0.84, 0.81),
    yy: A4[1] - 54,
  })

  y = A4[1] - hauteurBandeau - 34

  // Mention « Bon à payer »
  const mention = 'BON À PAYER · VALIDÉ PAR LE BUREAU'
  const largeurMention = gras.widthOfTextAtSize(ecrGras(mention), 10) + 20
  page.drawRectangle({ x: MARGE, y: y - 6, width: largeurMention, height: 20, color: rgb(0xe3 / 255, 0xf4 / 255, 0xe8 / 255) })
  ecrire(mention, MARGE + 10, { taille: 10, font: gras, couleur: VERT })
  y -= 34

  // ------------------------------------------------------------------ Blocs
  const titreSection = (titre: string) => {
    nouvellePageSiBesoin(60)
    ecrire(titre.toUpperCase(), MARGE, { taille: 9, font: gras, couleur: ORANGE })
    y -= 8
    page.drawLine({ start: { x: MARGE, y }, end: { x: MARGE + LARGEUR, y }, thickness: 0.8, color: FILET })
    y -= 16
  }

  const LARGEUR_LIBELLE = 150
  const ligneInfo = (libelle: string, valeur: string) => {
    const lignes = couper(valeur, LARGEUR - LARGEUR_LIBELLE, regular, 10)
    nouvellePageSiBesoin(lignes.length * 14 + 4)
    ecrire(libelle, MARGE, { taille: 9.5, couleur: GRIS })
    for (const ligne of lignes) {
      ecrire(ligne, MARGE + LARGEUR_LIBELLE, { taille: 10 })
      y -= 14
    }
    y -= 2
  }

  titreSection('Rencontre')
  ligneInfo('Date et heure', `${formatDateMatch(note.dateMatch)} à ${note.heureMatch.replace(':', 'h')}`)
  ligneInfo('Catégorie', note.categorie)
  ligneInfo('Match', `${note.equipeLocale} – ${note.equipeVisiteur}`)
  ligneInfo('Gymnase', note.salle)
  y -= 10

  titreSection('Arbitre')
  ligneInfo('Nom', `${note.nom} ${note.prenom}`)
  ligneInfo('Licence FFHandball', note.licence)
  ligneInfo('Adresse', note.adresse)
  ligneInfo('Contact', `${note.telephone} · ${note.email}`)
  y -= 10

  titreSection('Coordonnées bancaires')
  if (note.iban) {
    ligneInfo('Titulaire', note.titulaireCompte || `${note.prenom} ${note.nom}`)
    ligneInfo('IBAN', formaterIban(note.iban))
    ligneInfo('BIC', note.bic || 'Non renseigné')
  } else {
    ligneInfo('RIB', "Non fourni : RIB déjà connu du club. Vérifiez qu'il est à jour avant le virement.")
  }
  y -= 10

  // ------------------------------------------------------------------ Décompte
  titreSection('Décompte')
  const kmCentimes = fraisKilometriques(note)
  const total = totalCentimes(note)
  const lignesDecompte: [string, string][] = [
    ["Indemnité d'arbitrage", formatCentimes(note.indemniteCentimes)],
    [`Déplacement : ${note.kilometres} km aller-retour × ${formatBareme(note.baremeKmCentimes)}`, formatCentimes(kmCentimes)],
    ['Péage et parking', formatCentimes(note.fraisAnnexesCentimes)],
  ]
  for (const [libelle, montant] of lignesDecompte) {
    nouvellePageSiBesoin(20)
    ecrire(libelle, MARGE, { taille: 10 })
    ecrire(montant, MARGE + LARGEUR - regular.widthOfTextAtSize(ecr(montant), 10), { taille: 10 })
    y -= 8
    page.drawLine({ start: { x: MARGE, y }, end: { x: MARGE + LARGEUR, y }, thickness: 0.5, color: FILET })
    y -= 14
  }
  nouvellePageSiBesoin(40)
  page.drawRectangle({ x: MARGE, y: y - 12, width: LARGEUR, height: 30, color: FOND })
  ecrire('TOTAL À VERSER', MARGE + 10, { taille: 11, font: gras })
  const totalTexte = formatCentimes(total)
  ecrire(totalTexte, MARGE + LARGEUR - 10 - gras.widthOfTextAtSize(ecrGras(totalTexte), 14), {
    taille: 14,
    font: gras,
    yy: y - 1,
  })
  y -= 32
  if (note.totalDemandeCentimes !== total) {
    ecrire(
      `Montant demandé par l'arbitre : ${formatCentimes(note.totalDemandeCentimes)}. Frais ajustés par le bureau.`,
      MARGE,
      { taille: 9, couleur: GRIS }
    )
    y -= 14
  }
  y -= 10

  // ------------------------------------------------------------------ Justificatifs
  titreSection('Justificatifs joints')
  if (note.justificatifs.length === 0) {
    ligneInfo('Pièces', 'Aucune')
  } else {
    note.justificatifs.forEach((j, i) => ligneInfo(`Pièce ${i + 1}`, `${j.nom} (${formatTaille(j.taille)})`))
  }
  y -= 10

  // ------------------------------------------------------------------ Déclaration et validation
  const declarationArbitre = couper(
    `L'arbitre a certifié sur l'honneur l'exactitude de ces renseignements et avoir dirigé la rencontre pour le compte du HBC Aix-en-Savoie (le ${formatHorodatage.format(note.createdAt)}).`,
    LARGEUR,
    regular,
    9.5
  )
  const declarationBureau = couper(
    "Le validateur certifie la présence effective de l'arbitre sur cette rencontre et l'exactitude des éléments financiers.",
    LARGEUR,
    regular,
    9.5
  )
  const lignesCommentaire = note.commentaire ? couper(note.commentaire, LARGEUR - LARGEUR_LIBELLE, regular, 10).length : 0
  // Le visa ne se coupe pas : déclaration, validateur et signature restent sur la même page
  const hauteurVisa =
    40 + // titre de section
    (declarationArbitre.length + declarationBureau.length) * 13 +
    6 +
    (2 + lignesCommentaire) * 14 +
    8 +
    (note.signature ? 110 : 0)
  if (hauteurVisa < A4[1] - 2 * MARGE - 30) nouvellePageSiBesoin(hauteurVisa)
  titreSection('Déclaration et validation')
  for (const ligne of declarationArbitre) {
    nouvellePageSiBesoin(14)
    ecrire(ligne, MARGE, { taille: 9.5, couleur: GRIS })
    y -= 13
  }
  y -= 6
  ligneInfo('Validée par', note.traiteePar ?? '')
  ligneInfo('Le', note.traiteeLe ? formatHorodatage.format(note.traiteeLe) : '')
  if (note.commentaire) ligneInfo('Observation', note.commentaire)
  for (const ligne of declarationBureau) {
    nouvellePageSiBesoin(14)
    ecrire(ligne, MARGE, { taille: 9.5, couleur: GRIS })
    y -= 13
  }

  if (note.signature) {
    try {
      const image = await doc.embedPng(note.signature)
      const largeurMax = 220
      const hauteurMax = 80
      const echelle = Math.min(largeurMax / image.width, hauteurMax / image.height, 1)
      const l = image.width * echelle
      const h = image.height * echelle
      nouvellePageSiBesoin(h + 30)
      y -= 8
      ecrire('Signature', MARGE, { taille: 9.5, couleur: GRIS, yy: y - 12 })
      page.drawRectangle({
        x: MARGE + LARGEUR_LIBELLE - 6,
        y: y - h - 6,
        width: l + 12,
        height: h + 12,
        borderColor: FILET,
        borderWidth: 0.8,
      })
      page.drawImage(image, { x: MARGE + LARGEUR_LIBELLE, y: y - h, width: l, height: h })
      y -= h + 16
    } catch {
      ligneInfo('Signature', 'Signature enregistrée dans l’administration du site.')
    }
  }

  // ------------------------------------------------------------------ Pied de page
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    const pied = `HBC Aix-en-Savoie · 7 rue des Prés Riants, 73100 Aix-les-Bains · ${reference} · page ${i + 1}/${pages.length}`
    const propre = ecr(pied)
    p.drawText(propre, {
      x: (A4[0] - regular.widthOfTextAtSize(propre, 8)) / 2,
      y: 26,
      size: 8,
      font: regular,
      color: GRIS,
    })
  })

  return doc.save()
}
