import { describe, expect, test } from 'bun:test'
import {
  DELAI_APRES_COUP_ENVOI_MS,
  limiteMatchsOuverts,
  matchOuvert,
  placeDisponible,
} from '../src/lib/calendrier-regles'

const maintenant = new Date('2026-11-14T18:00:00Z')
const heure = 60 * 60 * 1000
const decale = (ms: number) => new Date(maintenant.getTime() + ms)

describe('matchs ouverts aux inscriptions', () => {
  test('la limite est trois heures avant maintenant', () => {
    expect(limiteMatchsOuverts(maintenant).toISOString()).toBe('2026-11-14T15:00:00.000Z')
    expect(DELAI_APRES_COUP_ENVOI_MS).toBe(3 * heure)
  })

  test('un match dans une heure est ouvert', () => {
    expect(matchOuvert({ date: decale(heure), termine: false }, maintenant)).toBe(true)
  })

  test('un match commencé il y a deux heures est ouvert', () => {
    expect(matchOuvert({ date: decale(-2 * heure), termine: false }, maintenant)).toBe(true)
  })

  test('un match commencé pile à la limite est ouvert', () => {
    expect(matchOuvert({ date: decale(-3 * heure), termine: false }, maintenant)).toBe(true)
  })

  test('un match commencé il y a quatre heures est fermé', () => {
    expect(matchOuvert({ date: decale(-4 * heure), termine: false }, maintenant)).toBe(false)
  })

  test('un match terminé est fermé, même dans le futur', () => {
    expect(matchOuvert({ date: decale(24 * heure), termine: true }, maintenant)).toBe(false)
  })
})

describe('quotas par rôle', () => {
  test.each([
    ['TABLE_DE_MARQUE', 2],
    ['ARBITRE', 2],
    ['RESPONSABLE_SALLE', 1],
  ] as const)('%s accepte %i bénévole(s)', (role, quota) => {
    expect(placeDisponible(role, 0)).toBe(true)
    expect(placeDisponible(role, quota - 1)).toBe(true)
    expect(placeDisponible(role, quota)).toBe(false)
    expect(placeDisponible(role, quota + 1)).toBe(false)
  })

  test('la buvette est toujours disponible', () => {
    expect(placeDisponible('BUVETTE', 0)).toBe(true)
    expect(placeDisponible('BUVETTE', 50)).toBe(true)
  })
})
