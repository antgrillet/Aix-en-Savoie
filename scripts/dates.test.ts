import { describe, expect, test } from 'bun:test'
import { bornesWeekend, formatDateHeure, formatHeure, formatJourCourt } from '../src/lib/dates'

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
