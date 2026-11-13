import { describe, expect, test } from 'bun:test'
import {
  bornesWeekend,
  formatDateHeure,
  formatHeure,
  formatJourCourt,
  lireChampDateHeure,
  versChampDateHeure,
} from '../src/lib/dates'

const iso = (d: Date) => d.toISOString()

describe('formatage au fuseau du club', () => {
  test("l'heure d'hiver est UTC+1", () => {
    expect(formatHeure(new Date('2026-11-14T19:30:00Z'))).toBe('20:30')
  })

  test("l'heure d'été est UTC+2", () => {
    expect(formatHeure(new Date('2026-09-12T18:30:00Z'))).toBe('20:30')
  })

  test('un match tard le soir reste sur le bon jour', () => {
    // 23:30 UTC le vendredi = 00:30 le samedi à Paris
    expect(formatJourCourt(new Date('2026-11-13T23:30:00Z'))).toBe('SAM. 14 NOV.')
    // Le séparateur entre date et heure dépend de la version d'ICU.
    expect(formatDateHeure(new Date('2026-11-14T20:00:00Z'))).toMatch(/^sam\. 14 nov\.(,| à) 21:00$/)
  })
})

describe('bornes du week-end', () => {
  const attendu = { debut: '2026-11-12T23:00:00.000Z', fin: '2026-11-15T22:59:59.999Z' }

  test.each([
    ['lundi', '2026-11-09T10:00:00Z'],
    ['vendredi', '2026-11-13T13:00:00Z'],
    ['samedi', '2026-11-14T13:00:00Z'],
    ['dimanche soir', '2026-11-15T21:00:00Z'],
  ])('%s vise le week-end du 13 au 15 novembre', (_nom, instant) => {
    const { debut, fin } = bornesWeekend(new Date(instant))
    expect({ debut: iso(debut), fin: iso(fin) }).toEqual(attendu)
  })

  test('le lundi suivant passe au week-end d\'après', () => {
    const { debut } = bornesWeekend(new Date('2026-11-16T08:00:00Z'))
    expect(iso(debut)).toBe('2026-11-19T23:00:00.000Z')
  })

  test('dimanche 00:30 à Paris est encore le week-end en cours', () => {
    // samedi 23:30 UTC = dimanche 00:30 à Paris
    const { debut } = bornesWeekend(new Date('2026-11-14T23:30:00Z'))
    expect(iso(debut)).toBe('2026-11-12T23:00:00.000Z')
  })

  test("le week-end du passage à l'heure d'hiver garde ses bornes à minuit", () => {
    // Dimanche 25 octobre 2026 : retour à UTC+1 dans la nuit
    const { debut, fin } = bornesWeekend(new Date('2026-10-24T10:00:00Z'))
    expect(iso(debut)).toBe('2026-10-22T22:00:00.000Z')
    expect(iso(fin)).toBe('2026-10-25T22:59:59.999Z')
  })
})

describe('champ date et heure du formulaire', () => {
  test("une saisie d'hiver est lue en UTC+1", () => {
    expect(lireChampDateHeure('2026-11-14T20:30')?.toISOString()).toBe('2026-11-14T19:30:00.000Z')
  })

  test("une saisie d'été est lue en UTC+2", () => {
    expect(lireChampDateHeure('2026-09-12T20:30')?.toISOString()).toBe('2026-09-12T18:30:00.000Z')
  })

  test('les secondes sont acceptées', () => {
    expect(lireChampDateHeure('2026-11-14T20:30:15')?.toISOString()).toBe('2026-11-14T19:30:15.000Z')
  })

  test("le champ affiche l'heure de Paris", () => {
    expect(versChampDateHeure(new Date('2026-11-14T19:30:00Z'))).toBe('2026-11-14T20:30')
    expect(versChampDateHeure(new Date('2026-11-14T23:05:00Z'))).toBe('2026-11-15T00:05')
  })

  test.each([
    ['hiver', '2026-11-14T19:30:00.000Z'],
    ['été', '2026-09-12T18:30:00.000Z'],
    ["jour du passage à l'heure d'été, après le changement", '2027-03-28T01:30:00.000Z'],
    ["jour du passage à l'heure d'été, l'après-midi", '2027-03-28T14:00:00.000Z'],
    ["jour du passage à l'heure d'hiver, après le changement", '2026-10-25T01:30:00.000Z'],
    ["jour du passage à l'heure d'hiver, le soir", '2026-10-25T19:00:00.000Z'],
    ['minuit à Paris', '2026-11-13T23:00:00.000Z'],
  ])('aller-retour sans décalage (%s)', (_nom, instant) => {
    expect(lireChampDateHeure(versChampDateHeure(new Date(instant)))?.toISOString()).toBe(instant)
  })

  test.each([
    '',
    'demain',
    '2026-13-01T10:00',
    '2026-02-30T10:00',
    '2026-11-14T25:00',
    '2026-11-14T20:60',
    '2026-11-14 20:30',
    '2026-11-14T20:30Z',
  ])('%p est refusé', (texte) => {
    expect(lireChampDateHeure(texte)).toBeNull()
  })
})
