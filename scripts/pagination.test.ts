import { describe, expect, test } from 'bun:test'
import { lireNumeroPage } from '../src/lib/pagination'

describe('lireNumeroPage', () => {
  test('une valeur absente ou vide donne la page 1', () => {
    expect(lireNumeroPage(undefined)).toBe(1)
    expect(lireNumeroPage('')).toBe(1)
  })

  test('zéro, négatif, non numérique ou décimal donnent la page 1', () => {
    expect(lireNumeroPage('0')).toBe(1)
    expect(lireNumeroPage('-3')).toBe(1)
    expect(lireNumeroPage('abc')).toBe(1)
    expect(lireNumeroPage('2.5')).toBe(1)
    expect(lireNumeroPage('7abc')).toBe(1)
  })

  test('un entier valide est repris tel quel', () => {
    expect(lireNumeroPage('7')).toBe(7)
  })

  test('un numéro démesuré est plafonné à 10 000', () => {
    expect(lireNumeroPage('999999999')).toBe(10_000)
  })
})
