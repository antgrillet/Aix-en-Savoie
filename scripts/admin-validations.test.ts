import { describe, expect, test } from 'bun:test'
import { ordreSchema } from '../src/lib/validations/ordre'
import { imageDeFondSchema, pageAvecFondSchema } from '../src/lib/validations/setting'

describe('ordre des équipes et partenaires', () => {
  test('un ordre valide est accepté', () => {
    const updates = [{ id: 1, ordre: 0 }, { id: 2, ordre: 1 }]
    expect(ordreSchema.parse(updates)).toEqual(updates)
  })

  test('un ordre négatif est refusé', () => {
    expect(ordreSchema.safeParse([{ id: 1, ordre: -1 }]).success).toBe(false)
  })

  test('un identifiant non entier est refusé', () => {
    expect(ordreSchema.safeParse([{ id: 1.5, ordre: 0 }]).success).toBe(false)
  })

  test('un tableau vide est refusé', () => {
    expect(ordreSchema.safeParse([]).success).toBe(false)
  })
})

describe('page avec image de fond', () => {
  test('une page connue est acceptée', () => {
    expect(pageAvecFondSchema.parse('actus')).toBe('actus')
    expect(pageAvecFondSchema.parse('legal')).toBe('legal')
  })

  test('une page inconnue est refusée', () => {
    expect(pageAvecFondSchema.safeParse('calendrier').success).toBe(false)
  })

  test('une chaîne contenant / est refusée', () => {
    expect(pageAvecFondSchema.safeParse('admin/parametres').success).toBe(false)
  })
})

describe('image de fond', () => {
  test('une URL invalide est refusée', () => {
    expect(imageDeFondSchema.safeParse('pas-une-url').success).toBe(false)
  })

  test('une URL valide est acceptée', () => {
    const url = 'https://exemple.public.blob.vercel-storage.com/fond.jpg'
    expect(imageDeFondSchema.parse(url)).toBe(url)
  })
})
