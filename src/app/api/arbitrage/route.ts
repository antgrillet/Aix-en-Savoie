import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { noteArbitrageSchema } from '@/lib/validations/arbitrage'
import {
  MAX_JUSTIFICATIFS,
  MAX_TAILLE_JUSTIFICATIF,
  MAX_TAILLE_TOTALE_JUSTIFICATIFS,
  detecterTypeJustificatif,
  nomFichierSur,
  referenceNote,
  totalCentimes,
} from '@/lib/arbitrage'
import { getReglagesArbitrage } from '@/lib/arbitrage-reglages'
import { notifierNouvelleNote } from '@/lib/arbitrage-email'

/** Plafond durable, toutes origines confondues, si la limite par adresse est contournée. */
const MAX_NOTES_PAR_HEURE = 30
/** Les justificatifs, les champs et l'enveloppe multipart. */
const MAX_TAILLE_REQUETE = MAX_TAILLE_TOTALE_JUSTIFICATIFS + 256 * 1024

const erreur = (message: string, status: number, champs?: Record<string, string>) =>
  NextResponse.json({ error: message, ...(champs ? { champs } : {}) }, { status })

export async function POST(request: NextRequest) {
  try {
    if (!rateLimit(`arbitrage:${clientIp(request)}`, { limit: 6, windowMs: 10 * 60 * 1000 })) {
      return erreur('Trop d’envois en peu de temps. Réessayez dans quelques minutes.', 429)
    }

    const longueur = Number(request.headers.get('content-length') ?? '0')
    if (longueur > MAX_TAILLE_REQUETE) {
      return erreur('Les justificatifs sont trop lourds : 4 Mo au total au plus.', 413)
    }

    const formData = await request.formData().catch(() => null)
    if (!formData) return erreur('Envoi illisible. Rechargez la page et réessayez.', 400)

    let brut: unknown = null
    try {
      brut = JSON.parse(String(formData.get('note') ?? ''))
    } catch {
      return erreur('Envoi illisible. Rechargez la page et réessayez.', 400)
    }

    const parsed = noteArbitrageSchema.safeParse(brut)
    if (!parsed.success) {
      const champs: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const champ = String(issue.path[0] ?? 'formulaire')
        champs[champ] ??= issue.message
      }
      return erreur('Certains champs sont à corriger.', 400, champs)
    }
    const note = parsed.data

    // Leurre rempli : on répond comme un succès sans rien enregistrer ni envoyer.
    if (note.leurre) {
      return NextResponse.json({ success: true, reference: 'ARB-0000-0000' })
    }

    // Justificatifs : nombre, taille et vrai type lu dans le contenu
    const fichiers = formData.getAll('justificatifs').filter((f): f is File => f instanceof File && f.size > 0)
    if (fichiers.length > MAX_JUSTIFICATIFS) {
      return erreur(`${MAX_JUSTIFICATIFS} justificatifs au plus.`, 400, { justificatifs: `${MAX_JUSTIFICATIFS} fichiers au plus.` })
    }
    let tailleTotale = 0
    const justificatifs: { nom: string; type: string; taille: number; contenu: Uint8Array<ArrayBuffer> }[] = []
    for (const fichier of fichiers) {
      if (fichier.size > MAX_TAILLE_JUSTIFICATIF) {
        return erreur('Un justificatif dépasse 3 Mo.', 413, { justificatifs: `« ${fichier.name} » dépasse 3 Mo.` })
      }
      tailleTotale += fichier.size
      if (tailleTotale > MAX_TAILLE_TOTALE_JUSTIFICATIFS) {
        return erreur('Les justificatifs dépassent 4 Mo au total.', 413, { justificatifs: 'Les justificatifs dépassent 4 Mo au total.' })
      }
      const contenu = new Uint8Array(await fichier.arrayBuffer())
      const type = detecterTypeJustificatif(contenu)
      if (!type) {
        return erreur('Format de justificatif non accepté.', 415, {
          justificatifs: `« ${fichier.name} » n'est ni une photo (JPEG, PNG, WebP) ni un PDF.`,
        })
      }
      justificatifs.push({ nom: nomFichierSur(fichier.name, type), type, taille: contenu.byteLength, contenu })
    }

    const recentes = await prisma.noteArbitrage.count({
      where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    })
    if (recentes >= MAX_NOTES_PAR_HEURE) {
      return erreur('Le formulaire est momentanément saturé. Réessayez dans une heure ou écrivez à contact@hbcaixensavoie.fr.', 429)
    }

    const { baremeKmCentimes } = await getReglagesArbitrage()
    const frais = {
      indemniteCentimes: note.indemnite,
      kilometres: note.kilometres,
      baremeKmCentimes,
      fraisAnnexesCentimes: note.fraisAnnexes,
    }

    const creee = await prisma.noteArbitrage.create({
      data: {
        dateMatch: new Date(`${note.dateMatch}T00:00:00Z`),
        heureMatch: note.heureMatch,
        categorie: note.categorie,
        equipeLocale: note.equipeLocale,
        equipeVisiteur: note.equipeVisiteur,
        salle: note.salle,
        nom: note.nom,
        prenom: note.prenom,
        licence: note.licence,
        adresse: note.adresse,
        telephone: note.telephone,
        email: note.email,
        titulaireCompte: note.iban ? note.titulaireCompte : null,
        iban: note.iban || null,
        bic: note.iban && note.bic ? note.bic : null,
        ...frais,
        totalDemandeCentimes: totalCentimes(frais),
        justificatifs: { create: justificatifs },
      },
      select: { id: true, createdAt: true },
    })

    const envoi = await notifierNouvelleNote({
      ...note,
      ...frais,
      id: creee.id,
      createdAt: creee.createdAt,
      dateMatch: new Date(`${note.dateMatch}T00:00:00Z`),
      nombreJustificatifs: justificatifs.length,
    })
    if (!envoi.ok) {
      // La note est enregistrée : le bureau la verra dans l'admin malgré tout.
      console.error('Notification de note d’arbitrage non envoyée')
    }

    return NextResponse.json({ success: true, reference: referenceNote(creee) })
  } catch (error) {
    console.error('Dépôt de note d’arbitrage :', error instanceof Error ? error.message : 'erreur inconnue')
    return erreur('La note n’a pas pu être enregistrée. Réessayez dans un instant.', 500)
  }
}
