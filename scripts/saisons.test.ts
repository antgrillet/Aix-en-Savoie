import { describe, expect, test } from 'bun:test'
import { bornesSaison, libelleSaison, lireSaison, saisonDe, saisonsEntre } from '../src/lib/saisons'

describe('saison d’une date', () => {
  test('novembre 2026 appartient à 2026-2027', () => {
    expect(saisonDe(new Date('2026-11-14T19:30:00Z'))).toBe(2026)
  })

  test('mai 2027 appartient encore à 2026-2027', () => {
    expect(saisonDe(new Date('2027-05-20T18:00:00Z'))).toBe(2026)
  })

  test('la bascule se fait le 1er août à minuit, heure de Paris', () => {
    // 31 juillet 23:59 à Paris (UTC+2) = 21:59 UTC
    expect(saisonDe(new Date('2027-07-31T21:59:00Z'))).toBe(2026)
    // 1er août 00:30 à Paris = 31 juillet 22:30 UTC
    expect(saisonDe(new Date('2027-07-31T22:30:00Z'))).toBe(2027)
  })
})

describe('bornes', () => {
  test('du 1er août au 1er août suivant, minuit à Paris', () => {
    const { debut, fin } = bornesSaison(2026)
    expect(debut.toISOString()).toBe('2026-07-31T22:00:00.000Z')
    expect(fin.toISOString()).toBe('2027-07-31T22:00:00.000Z')
  })

  test('libellé', () => {
    expect(libelleSaison(2026)).toBe('2026-2027')
  })
})

describe('lecture d’un paramètre', () => {
  test.each([
    ['2025', 2025],
    ['2025-2026', 2025],
    [' 2024 ', 2024],
  ])('%s → %d', (texte, attendu) => {
    expect(lireSaison(texte)).toBe(attendu)
  })

  test.each([[''], [null], ['2025-2027'], ['abc'], ['1999'], ['20255']])('%s est refusé', (texte) => {
    expect(lireSaison(texte)).toBeNull()
  })
})

test('liste des saisons, de la plus récente à la plus ancienne', () => {
  expect(saisonsEntre(2023, 2026)).toEqual([2026, 2025, 2024, 2023])
})
