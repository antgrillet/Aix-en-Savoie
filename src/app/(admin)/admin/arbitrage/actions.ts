'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-utils'
import { updateSetting } from '@/lib/settings'
import {
  CLE_BAREME_KM,
  CLE_EMAIL_COMPTABLE,
  MAX_TAILLE_SIGNATURE,
  centimesEnSaisie,
} from '@/lib/arbitrage'
import { getReglagesArbitrage } from '@/lib/arbitrage-reglages'
import { genererPdfNote } from '@/lib/arbitrage-pdf'
import { envoyerAuComptable, informerArbitre } from '@/lib/arbitrage-email'
import {
  refusNoteSchema,
  reglagesArbitrageSchema,
  validationNoteSchema,
  type ValidationNoteSaisie,
} from '@/lib/validations/arbitrage'
import type { StatutNoteArbitrage } from '@/generated/prisma/client'

export type ResultatAction =
  | { ok: true; message: string; avertissement?: string }
  | { ok: false; erreur: string; champs?: Record<string, string> }

const champsDepuis = (issues: { path: PropertyKey[]; message: string }[]) => {
  const champs: Record<string, string> = {}
  for (const issue of issues) champs[String(issue.path[0] ?? 'formulaire')] ??= issue.message
  return champs
}

const revalider = (id?: number) => {
  revalidatePath('/admin', 'layout')
  if (id) revalidatePath(`/admin/arbitrage/${id}`)
}

/** Liste sans les contenus lourds (signature, justificatifs). */
export async function getNotes() {
  await requireAdmin()
  return prisma.noteArbitrage.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      dateMatch: true,
      categorie: true,
      equipeLocale: true,
      equipeVisiteur: true,
      nom: true,
      prenom: true,
      statut: true,
      indemniteCentimes: true,
      kilometres: true,
      baremeKmCentimes: true,
      fraisAnnexesCentimes: true,
      envoiComptableLe: true,
      envoiComptableErreur: true,
      _count: { select: { justificatifs: true } },
    },
  })
}

export async function getNote(id: number) {
  await requireAdmin()
  if (!Number.isInteger(id) || id <= 0) return null
  const note = await prisma.noteArbitrage.findUnique({
    where: { id },
    include: {
      justificatifs: {
        orderBy: { id: 'asc' },
        select: { id: true, nom: true, type: true, taille: true },
      },
    },
  })
  if (!note) return null
  const { signature, ...reste } = note
  // La signature part vers la page en data URL, pas en octets bruts
  return {
    ...reste,
    signature: signature ? `data:image/png;base64,${Buffer.from(signature).toString('base64')}` : null,
  }
}

export type NoteDetail = NonNullable<Awaited<ReturnType<typeof getNote>>>

/**
 * PDF + justificatifs au comptable, et trace de l'envoi sur la note.
 * Rejouable : sert aussi au bouton « Renvoyer au comptable ».
 */
async function transmettreAuComptable(id: number): Promise<{ ok: true } | { ok: false; erreur: string }> {
  const note = await prisma.noteArbitrage.findUnique({
    where: { id },
    include: { justificatifs: { orderBy: { id: 'asc' } } },
  })
  if (!note || note.statut !== 'VALIDEE') return { ok: false, erreur: 'Note introuvable ou non validée.' }

  const { emailComptable } = await getReglagesArbitrage()
  let resultat: { ok: true } | { ok: false; erreur: string }
  try {
    const pdf = await genererPdfNote(note)
    resultat = await envoyerAuComptable(note, emailComptable, pdf, note.justificatifs)
  } catch (error) {
    console.error('PDF de note d’arbitrage :', error instanceof Error ? error.message : 'erreur inconnue')
    resultat = { ok: false, erreur: 'Le PDF n’a pas pu être généré.' }
  }

  await prisma.noteArbitrage.update({
    where: { id },
    data: resultat.ok
      ? { envoiComptableLe: new Date(), envoiComptableA: emailComptable, envoiComptableErreur: null }
      : { envoiComptableErreur: resultat.erreur.slice(0, 500) },
  })
  return resultat
}

/** Décode la signature dessinée : un vrai PNG, de taille raisonnable. */
function lireSignature(dataUrl: string): Uint8Array<ArrayBuffer> | null {
  const base64 = dataUrl.slice('data:image/png;base64,'.length)
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return null
  const octets = new Uint8Array(Buffer.from(base64, 'base64'))
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (octets.byteLength < 100 || octets.byteLength > MAX_TAILLE_SIGNATURE) return null
  if (!png.every((octet, i) => octets[i] === octet)) return null
  return octets
}

export async function validerNote(saisie: ValidationNoteSaisie): Promise<ResultatAction> {
  const session = await requireAdmin()

  const parsed = validationNoteSchema.safeParse(saisie)
  if (!parsed.success) {
    return { ok: false, erreur: 'Certains champs sont à corriger.', champs: champsDepuis(parsed.error.issues) }
  }
  const v = parsed.data
  const signature = lireSignature(v.signature)
  if (!signature) {
    return { ok: false, erreur: 'La signature est illisible.', champs: { signature: 'Effacez et signez à nouveau.' } }
  }

  // Seule une note encore en attente se valide : deux clics ou deux membres du
  // bureau en même temps ne l'envoient pas deux fois au comptable.
  const maj = await prisma.noteArbitrage.updateMany({
    where: { id: v.id, statut: 'EN_ATTENTE' },
    data: {
      indemniteCentimes: v.indemnite,
      kilometres: v.kilometres,
      baremeKmCentimes: v.bareme,
      fraisAnnexesCentimes: v.fraisAnnexes,
      statut: 'VALIDEE',
      traiteePar: v.validateur,
      traiteeParId: session.user.id,
      traiteeLe: new Date(),
      commentaire: v.commentaire || null,
      motifRefus: null,
      signature,
    },
  })
  if (maj.count === 0) {
    revalider(v.id)
    return { ok: false, erreur: 'Cette note a déjà été traitée ou n’existe plus.' }
  }

  const envoi = await transmettreAuComptable(v.id)

  const note = await prisma.noteArbitrage.findUnique({ where: { id: v.id } })
  if (note) {
    const information = await informerArbitre(note, { statut: 'VALIDEE' })
    if (!information.ok) console.error('Mail de validation à l’arbitre non envoyé')
  }

  revalider(v.id)
  if (!envoi.ok) {
    return {
      ok: true,
      message: 'Note validée',
      avertissement: `L'envoi au comptable a échoué (${envoi.erreur}). Utilisez « Renvoyer au comptable ».`,
    }
  }
  return { ok: true, message: 'Note validée et envoyée au comptable' }
}

export async function renvoyerAuComptable(id: number): Promise<ResultatAction> {
  await requireAdmin()
  const envoi = await transmettreAuComptable(id)
  revalider(id)
  return envoi.ok
    ? { ok: true, message: 'Note renvoyée au comptable' }
    : { ok: false, erreur: `Envoi impossible : ${envoi.erreur}` }
}

export async function refuserNote(saisie: { id: number; motif: string }): Promise<ResultatAction> {
  const session = await requireAdmin()
  const parsed = refusNoteSchema.safeParse(saisie)
  if (!parsed.success) {
    return { ok: false, erreur: 'Motif à compléter.', champs: champsDepuis(parsed.error.issues) }
  }
  const { id, motif } = parsed.data

  const maj = await prisma.noteArbitrage.updateMany({
    where: { id, statut: 'EN_ATTENTE' },
    data: {
      statut: 'REFUSEE',
      motifRefus: motif,
      traiteePar: session.user.name || session.user.email,
      traiteeParId: session.user.id,
      traiteeLe: new Date(),
    },
  })
  if (maj.count === 0) {
    revalider(id)
    return { ok: false, erreur: 'Cette note a déjà été traitée ou n’existe plus.' }
  }

  const note = await prisma.noteArbitrage.findUnique({ where: { id } })
  const information = note ? await informerArbitre(note, { statut: 'REFUSEE', motif }) : { ok: false as const }
  revalider(id)
  return information.ok
    ? { ok: true, message: 'Note refusée, l’arbitre est prévenu par e-mail' }
    : { ok: true, message: 'Note refusée', avertissement: "Le mail à l'arbitre n'est pas parti : prévenez-le directement." }
}

/** Remet une note refusée à valider (refus par erreur). */
export async function remettreEnAttente(id: number): Promise<ResultatAction> {
  await requireAdmin()
  const maj = await prisma.noteArbitrage.updateMany({
    where: { id, statut: 'REFUSEE' },
    data: { statut: 'EN_ATTENTE', motifRefus: null, traiteePar: null, traiteeParId: null, traiteeLe: null },
  })
  revalider(id)
  return maj.count > 0
    ? { ok: true, message: 'Note remise à valider' }
    : { ok: false, erreur: 'Seule une note refusée peut être remise à valider.' }
}

export async function supprimerNote(id: number): Promise<ResultatAction> {
  await requireAdmin()
  const supprimees = await prisma.noteArbitrage.deleteMany({ where: { id } })
  revalider()
  return supprimees.count > 0
    ? { ok: true, message: 'Note supprimée' }
    : { ok: false, erreur: 'Cette note n’existe plus.' }
}

export async function getReglagesArbitrageAdmin() {
  await requireAdmin()
  const reglages = await getReglagesArbitrage()
  return { emailComptable: reglages.emailComptable, bareme: centimesEnSaisie(reglages.baremeKmCentimes) }
}

export async function enregistrerReglagesArbitrage(saisie: {
  emailComptable: string
  bareme: string
}): Promise<ResultatAction> {
  const session = await requireAdmin()
  const parsed = reglagesArbitrageSchema.safeParse(saisie)
  if (!parsed.success) {
    return { ok: false, erreur: 'Certains champs sont à corriger.', champs: champsDepuis(parsed.error.issues) }
  }
  await updateSetting(CLE_EMAIL_COMPTABLE, parsed.data.emailComptable, session.user.id)
  await updateSetting(CLE_BAREME_KM, centimesEnSaisie(parsed.data.bareme), session.user.id)
  revalidatePath('/admin/parametres')
  revalidatePath('/arbitrage')
  return { ok: true, message: 'Réglages des notes d’arbitrage enregistrés' }
}

export type NoteListe = Awaited<ReturnType<typeof getNotes>>[number]
export type Statut = StatutNoteArbitrage
