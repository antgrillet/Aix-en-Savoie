import { Resend } from 'resend'
import {
  EMAIL_CLUB,
  formatCentimes,
  formatDateMatch,
  referenceNote,
  totalCentimes,
  type FraisArbitrage,
} from '@/lib/arbitrage'
import { SITE_URL } from '@/lib/seo'

/**
 * Créé à l'envoi, pas à l'import : sans clé, la note est quand même
 * enregistrée et l'admin dit que le mail n'est pas parti.
 */
let client: Resend | null = null
function resend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY manquante')
  client ??= new Resend(process.env.RESEND_API_KEY)
  return client
}

const expediteur = () => process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

const echapper = (valeur: string) =>
  valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Un objet de mail tient sur une ligne. */
const objet = (texte: string) => texte.replace(/[\r\n]+/g, ' ').slice(0, 200)

interface NoteResume extends FraisArbitrage {
  id: number
  createdAt: Date
  dateMatch: Date
  heureMatch: string
  categorie: string
  equipeLocale: string
  equipeVisiteur: string
  nom: string
  prenom: string
  email: string
}

export type ResultatEnvoi = { ok: true } | { ok: false; erreur: string }

async function envoyer(message: Parameters<Resend['emails']['send']>[0]): Promise<ResultatEnvoi> {
  try {
    const { error } = await resend().emails.send(message)
    // Le SDK Resend ne lève pas d'exception sur une erreur d'API : il la renvoie.
    if (error) {
      console.error("Envoi d'un mail d'arbitrage refusé :", error.name)
      return { ok: false, erreur: error.message || error.name }
    }
    return { ok: true }
  } catch (error) {
    console.error("Envoi d'un mail d'arbitrage impossible :", error instanceof Error ? error.message : 'erreur inconnue')
    return { ok: false, erreur: error instanceof Error ? error.message : 'Erreur inconnue' }
  }
}

function gabarit(titre: string, corps: string): string {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#f3f2ee;font-family:Arial,Helvetica,sans-serif;color:#1f1e1b;line-height:1.5">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#1f1e1b;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;border-bottom:4px solid #e8731a">
      <div style="font-size:13px;color:#d9d6cf">HBC Aix-en-Savoie · Arbitrage</div>
      <div style="font-size:20px;font-weight:bold;margin-top:4px">${titre}</div>
    </div>
    <div style="background:#fff;padding:24px;border:1px solid #e4e1da;border-top:0;border-radius:0 0 12px 12px">
      ${corps}
    </div>
    <p style="font-size:12px;color:#5c5852;text-align:center;margin-top:16px">
      HBC Aix-en-Savoie · 7 rue des Prés Riants, 73100 Aix-les-Bains
    </p>
  </div>
</body></html>`
}

function tableau(lignes: [string, string][]): string {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${lignes
    .map(
      ([libelle, valeur]) =>
        `<tr><td style="padding:6px 0;color:#5c5852;width:40%;vertical-align:top">${echapper(libelle)}</td><td style="padding:6px 0;font-weight:600">${echapper(valeur)}</td></tr>`
    )
    .join('')}</table>`
}

function lignesMatch(note: NoteResume): [string, string][] {
  return [
    ['Référence', referenceNote(note)],
    ['Arbitre', `${note.prenom} ${note.nom}`],
    ['Match', `${note.equipeLocale} – ${note.equipeVisiteur}`],
    ['Date', `${formatDateMatch(note.dateMatch)} à ${note.heureMatch.replace(':', 'h')}`],
    ['Catégorie', note.categorie],
    ['Total', formatCentimes(totalCentimes(note))],
  ]
}

/** Au club : une note vient d'arriver (sans coordonnées bancaires dans le mail). */
export function notifierNouvelleNote(note: NoteResume & { nombreJustificatifs: number }) {
  const lien = `${SITE_URL}/admin/arbitrage/${note.id}`
  return envoyer({
    from: expediteur(),
    to: EMAIL_CLUB,
    replyTo: note.email,
    subject: objet(`[Arbitrage] Note à valider · ${note.prenom} ${note.nom} · ${formatDateMatch(note.dateMatch, true)}`),
    html: gabarit(
      'Une note d’arbitrage attend votre validation',
      `${tableau([...lignesMatch(note), ['Justificatifs', String(note.nombreJustificatifs)]])}
      <p style="margin:24px 0 0"><a href="${lien}" style="display:inline-block;background:#e8731a;color:#1f1e1b;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:8px">Vérifier et valider la note</a></p>
      <p style="font-size:13px;color:#5c5852;margin-top:16px">Les coordonnées bancaires et les justificatifs sont dans l'administration du site, pas dans ce mail.</p>`
    ),
  })
}

/** Au comptable : la note validée, en PDF, avec ses justificatifs. */
export function envoyerAuComptable(
  note: NoteResume & { traiteePar: string | null; commentaire: string | null },
  destinataire: string,
  pdf: Uint8Array,
  justificatifs: { nom: string; contenu: Uint8Array }[]
) {
  const reference = referenceNote(note)
  return envoyer({
    from: expediteur(),
    to: destinataire,
    replyTo: EMAIL_CLUB,
    subject: objet(`[Arbitrage] Bon à payer ${reference} · ${note.prenom} ${note.nom} · ${formatCentimes(totalCentimes(note))}`),
    html: gabarit(
      'Note d’arbitrage validée · bon à payer',
      `<p style="margin:0 0 16px">Bonjour,<br>Le bureau a validé la note d’arbitrage ci-dessous. Le détail signé et les coordonnées bancaires sont dans le PDF joint.</p>
      ${tableau([
        ...lignesMatch(note),
        ['Validée par', note.traiteePar ?? ''],
        ...(note.commentaire ? ([['Observation', note.commentaire]] as [string, string][]) : []),
        ['Pièces jointes', `PDF de la note${justificatifs.length > 0 ? ` + ${justificatifs.length} justificatif${justificatifs.length > 1 ? 's' : ''}` : ''}`],
      ])}`
    ),
    attachments: [
      { filename: `Note-arbitrage-${reference}.pdf`, content: Buffer.from(pdf) },
      ...justificatifs.map((j, i) => ({
        filename: `${reference}-justificatif-${i + 1}-${j.nom}`,
        content: Buffer.from(j.contenu),
      })),
    ],
  })
}

/** À l'arbitre : sa note est validée (le paiement suit) ou refusée (avec le motif). */
export function informerArbitre(
  note: NoteResume,
  decision: { statut: 'VALIDEE' } | { statut: 'REFUSEE'; motif: string }
) {
  const reference = referenceNote(note)
  const validee = decision.statut === 'VALIDEE'
  return envoyer({
    from: expediteur(),
    to: note.email,
    replyTo: EMAIL_CLUB,
    subject: objet(
      validee
        ? `Votre note d'arbitrage ${reference} est validée`
        : `Votre note d'arbitrage ${reference} n'a pas été validée`
    ),
    html: gabarit(
      validee ? 'Note validée' : 'Note non validée',
      `<p style="margin:0 0 16px">Bonjour ${echapper(note.prenom)},</p>
      <p style="margin:0 0 16px">${
        validee
          ? `Le bureau du club a validé votre note pour le match du ${echapper(formatDateMatch(note.dateMatch))}. Elle est transmise à la comptabilité pour le virement de <strong>${echapper(formatCentimes(totalCentimes(note)))}</strong>.`
          : `Le bureau du club n'a pas pu valider votre note pour le match du ${echapper(formatDateMatch(note.dateMatch))}.`
      }</p>
      ${validee ? '' : `<p style="margin:0 0 16px;padding:12px;background:#fce8e6;border-radius:8px"><strong>Motif :</strong> ${echapper(decision.motif)}</p><p style="margin:0 0 16px">Vous pouvez déposer une nouvelle note corrigée sur <a href="${SITE_URL}/arbitrage" style="color:#9a4308">${SITE_URL.replace('https://', '')}/arbitrage</a>.</p>`}
      ${tableau(lignesMatch(note))}
      <p style="font-size:13px;color:#5c5852;margin-top:16px">Une question ? Répondez simplement à ce mail.</p>`
    ),
  })
}
