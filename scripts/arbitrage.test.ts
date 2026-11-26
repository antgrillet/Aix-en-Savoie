import { describe, expect, test } from 'bun:test'
import { PDFDocument } from 'pdf-lib'
import {
  centimesEnSaisie,
  decalerJour,
  aujourdhuiParis,
  detecterTypeJustificatif,
  eurosEnCentimes,
  formaterIban,
  ibanValide,
  lireBareme,
  nomFichierSur,
  referenceNote,
  totalCentimes,
} from '../src/lib/arbitrage'
import { genererPdfNote } from '../src/lib/arbitrage-pdf'
import { noteArbitrageSchema, validationNoteSchema } from '../src/lib/validations/arbitrage'

// IBAN de démonstration publié par la Banque de France (clé valide)
const IBAN_TEST = 'FR76 3000 6000 0112 3456 7890 189'

describe('montants', () => {
  test('la saisie en euros devient des centimes entiers', () => {
    expect(eurosEnCentimes('12')).toBe(1200)
    expect(eurosEnCentimes('12,5')).toBe(1250)
    expect(eurosEnCentimes('12.05')).toBe(1205)
    expect(eurosEnCentimes(' 1 250,00 ')).toBe(125000)
    expect(eurosEnCentimes('')).toBe(0)
    expect(eurosEnCentimes('-3')).toBeNull()
    expect(eurosEnCentimes('1,234')).toBeNull()
    expect(eurosEnCentimes('abc')).toBeNull()
    expect(centimesEnSaisie(1205)).toBe('12,05')
    expect(centimesEnSaisie(32)).toBe('0,32')
  })

  test('le total arrondit les kilomètres au centime', () => {
    expect(totalCentimes({ indemniteCentimes: 2500, kilometres: 47, baremeKmCentimes: 32, fraisAnnexesCentimes: 340 })).toBe(
      2500 + 47 * 32 + 340
    )
  })

  test('un barème illisible retombe sur le défaut', () => {
    expect(lireBareme('0,40')).toBe(40)
    expect(lireBareme(undefined)).toBe(32)
    expect(lireBareme('n’importe quoi')).toBe(32)
  })
})

describe('IBAN', () => {
  test('clé modulo 97 et longueur française', () => {
    expect(ibanValide(IBAN_TEST)).toBe(true)
    expect(ibanValide(IBAN_TEST.replace('189', '188'))).toBe(false)
    expect(ibanValide('FR76300060000112345678901')).toBe(false)
    expect(formaterIban('fr7630006000011234567890189')).toBe(IBAN_TEST)
  })
})

describe('justificatifs', () => {
  test('le type vient des octets, pas du nom', () => {
    expect(detecterTypeJustificatif(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    expect(detecterTypeJustificatif(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]))).toBe('application/pdf')
    expect(detecterTypeJustificatif(new TextEncoder().encode('<html><script>'))).toBeNull()
    expect(nomFichierSur('Ticket péage "A41".jpeg', 'image/jpeg')).toBe('Ticket-peage-A41.jpg')
    expect(nomFichierSur('../../', 'application/pdf')).toBe('justificatif.pdf')
  })

  test('référence lisible', () => {
    expect(referenceNote({ id: 7, createdAt: new Date('2026-11-26T10:00:00Z') })).toBe('ARB-2026-0007')
  })
})

const saisieValide = () => ({
  dateMatch: decalerJour(aujourdhuiParis(), -2),
  heureMatch: '20:30',
  categorie: 'Seniors Masculins',
  equipeLocale: 'HBC Aix-en-Savoie',
  equipeVisiteur: 'Chambéry',
  salle: 'Gymnase du Bord du Lac',
  nom: 'Dupont',
  prenom: 'Camille',
  licence: '5873012345',
  adresse: '12 rue des Lilas, 73100 Aix-les-Bains',
  telephone: '06 12 34 56 78',
  email: 'camille@example.com',
  titulaireCompte: 'Camille Dupont',
  iban: IBAN_TEST,
  bic: 'BNPAFRPP',
  indemnite: '25',
  kilometres: '40',
  fraisAnnexes: '',
  certification: true as const,
})

describe('note déposée par l’arbitre', () => {
  test('une note complète passe et sort en centimes', () => {
    const r = noteArbitrageSchema.safeParse(saisieValide())
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.nom).toBe('DUPONT')
      expect(r.data.indemnite).toBe(2500)
      expect(r.data.kilometres).toBe(40)
      expect(r.data.iban).toBe('FR7630006000011234567890189')
    }
  })

  test('refuse un match à venir, un IBAN sans titulaire et une note à zéro', () => {
    const futur = noteArbitrageSchema.safeParse({ ...saisieValide(), dateMatch: decalerJour(aujourdhuiParis(), 1) })
    expect(futur.success).toBe(false)

    const sansTitulaire = noteArbitrageSchema.safeParse({ ...saisieValide(), titulaireCompte: '' })
    expect(sansTitulaire.success).toBe(false)

    const vide = noteArbitrageSchema.safeParse({ ...saisieValide(), indemnite: '', kilometres: '', fraisAnnexes: '' })
    expect(vide.success).toBe(false)

    const sansRib = noteArbitrageSchema.safeParse({ ...saisieValide(), iban: '', bic: '', titulaireCompte: '' })
    expect(sansRib.success).toBe(true)
  })

  test('les retours à la ligne ne passent pas dans les champs courts', () => {
    const r = noteArbitrageSchema.safeParse({ ...saisieValide(), salle: 'Gymnase\r\nBcc: x@y.z' })
    expect(r.success && r.data.salle).toBe('Gymnase Bcc: x@y.z')
  })
})

describe('validation du bureau', () => {
  test('exige certification et signature PNG', () => {
    const base = {
      id: 1,
      indemnite: '25',
      kilometres: '40',
      bareme: '0,32',
      fraisAnnexes: '0',
      validateur: 'Trésorier',
      commentaire: '',
      certification: true as const,
      signature: 'data:image/png;base64,iVBORw0KGgo=',
    }
    expect(validationNoteSchema.safeParse(base).success).toBe(true)
    expect(validationNoteSchema.safeParse({ ...base, certification: false }).success).toBe(false)
    expect(validationNoteSchema.safeParse({ ...base, signature: 'data:image/svg+xml;base64,AAAA' }).success).toBe(false)
  })
})

describe('PDF', () => {
  test('se génère avec accents, espaces fines et signature', async () => {
    // Signature : un PNG 1×1 transparent
    const png = Uint8Array.from(
      atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
      (c) => c.charCodeAt(0)
    )
    const pdf = await genererPdfNote({
      id: 12,
      createdAt: new Date('2026-11-20T18:00:00Z'),
      dateMatch: new Date('2026-11-15T00:00:00Z'),
      heureMatch: '20:30',
      categorie: '−18 ans Féminines · Pré-région',
      equipeLocale: 'HBC Aix-en-Savoie',
      equipeVisiteur: 'Entente Cœur de Savoie',
      salle: 'Gymnase Garibaldi',
      nom: 'DUPONT',
      prenom: 'Zoé',
      licence: '5873012345',
      adresse: '12 rue des Lilas, 73100 Aix-les-Bains',
      telephone: '06 12 34 56 78',
      email: 'zoe@example.com',
      titulaireCompte: 'Zoé Dupont',
      iban: 'FR7630006000011234567890189',
      bic: 'BNPAFRPP',
      indemniteCentimes: 2500,
      kilometres: 47,
      baremeKmCentimes: 32,
      fraisAnnexesCentimes: 340,
      totalDemandeCentimes: 4000,
      traiteePar: 'Jean Trésorier',
      traiteeLe: new Date('2026-11-21T09:00:00Z'),
      commentaire: 'Feuille de match vérifiée ; RAS 👍',
      signature: png,
      justificatifs: [{ nom: 'péage.jpg', taille: 182_000 }],
    })
    expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe('%PDF-')
    const relu = await PDFDocument.load(pdf)
    expect(relu.getPageCount()).toBeGreaterThanOrEqual(1)
  })
})
