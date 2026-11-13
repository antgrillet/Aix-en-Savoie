import { describe, expect, test } from 'bun:test'
import { ZodError } from 'zod'
import { lireMatchFormData } from '../src/lib/validations/match'

/** Formulaire tel que l'envoie `MatchForm`, avec des valeurs à remplacer. */
function formulaire(valeurs: Record<string, string> = {}) {
  const formData = new FormData()
  const champs = {
    equipeId: '3',
    adversaire: '  Chambéry SH  ',
    date: '2026-11-14T20:30',
    lieu: ' Gymnase des Prés Riants ',
    domicile: 'true',
    competition: ' Championnat ',
    termine: 'true',
    scoreEquipe: '28',
    scoreAdversaire: '24',
    published: 'true',
    ...valeurs,
  }
  for (const [nom, valeur] of Object.entries(champs)) formData.set(nom, valeur)
  return formData
}

/** Messages Zod levés par la lecture du formulaire. */
function erreurs(formData: FormData): string[] {
  try {
    lireMatchFormData(formData)
  } catch (error) {
    if (error instanceof ZodError) return error.issues.map((issue) => issue.message)
    throw error
  }
  throw new Error('Le formulaire aurait dû être refusé')
}

describe('lecture du formulaire de match', () => {
  test('un formulaire complet donne un match prêt pour Prisma', () => {
    const match = lireMatchFormData(formulaire())
    expect(match).toEqual({
      equipeId: 3,
      adversaire: 'Chambéry SH',
      date: new Date('2026-11-14T19:30:00.000Z'),
      lieu: 'Gymnase des Prés Riants',
      domicile: true,
      competition: 'Championnat',
      termine: true,
      scoreEquipe: 28,
      scoreAdversaire: 24,
      published: true,
    })
    expect(match.date.toISOString()).toBe('2026-11-14T19:30:00.000Z')
  })

  test("une compétition vide devient null et l'heure d'été est lue en UTC+2", () => {
    const match = lireMatchFormData(formulaire({ competition: '   ', date: '2026-09-12T20:30' }))
    expect(match.competition).toBeNull()
    expect(match.date.toISOString()).toBe('2026-09-12T18:30:00.000Z')
  })

  test('une date invalide est refusée', () => {
    expect(erreurs(formulaire({ date: '2026-02-30T20:30' }))).toEqual(['Date du match invalide'])
    expect(erreurs(formulaire({ date: '' }))).toEqual(['Date du match invalide'])
  })

  test('un identifiant d\'équipe non numérique est refusé', () => {
    expect(erreurs(formulaire({ equipeId: 'abc' }))).toEqual(['Équipe invalide'])
    expect(erreurs(formulaire({ equipeId: '' }))).toEqual(['Équipe invalide'])
  })

  test('un score négatif est refusé', () => {
    expect(erreurs(formulaire({ scoreEquipe: '-1' }))).toEqual(['Le score ne peut pas être négatif'])
  })

  test('un score décimal ou au-delà de 99 est refusé', () => {
    expect(erreurs(formulaire({ scoreAdversaire: '2.5' }))).toEqual(['Le score est un nombre entier'])
    expect(erreurs(formulaire({ scoreAdversaire: '100' }))).toEqual(['Le score ne peut pas dépasser 99'])
  })

  test("le score est ignoré quand le match n'est pas terminé", () => {
    const match = lireMatchFormData(formulaire({ termine: 'false', scoreEquipe: '-5', scoreAdversaire: 'x' }))
    expect(match.termine).toBe(false)
    expect(match.scoreEquipe).toBeNull()
    expect(match.scoreAdversaire).toBeNull()
  })

  test('un score vide reste sans score pour un match terminé', () => {
    const match = lireMatchFormData(formulaire({ scoreEquipe: '', scoreAdversaire: '' }))
    expect(match.scoreEquipe).toBeNull()
    expect(match.scoreAdversaire).toBeNull()
  })

  test('un adversaire vide est refusé', () => {
    expect(erreurs(formulaire({ adversaire: '   ' }))).toEqual(['L\'adversaire est requis'])
  })
})
