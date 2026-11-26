import { describe, expect, test } from 'bun:test'
import type { ATraiter } from '../src/components/admin/a-traiter'
import { classerUrgences } from '../src/components/admin/urgences'

const maintenant = new Date('2026-11-26T10:00:00Z') // jeudi
const jours = (n: number) => new Date(maintenant.getTime() + n * 24 * 60 * 60 * 1000)

function aTraiter(partiel: Partial<ATraiter>): ATraiter {
  return {
    messagesNonLus: 0,
    brouillons: 0,
    scoresEnAttente: 0,
    equipesSansLien: 0,
    equipesSansLienNoms: [],
    notesArbitrage: 0,
    plusAncienneNoteArbitrage: null,
    echeances: { plusAncienMessage: null, plusAncienScore: null },
    ...partiel,
  }
}

describe('classerUrgences', () => {
  test("rien à traiter : aucune carte", () => {
    expect(classerUrgences(aTraiter({}), maintenant)).toEqual([])
  })

  test('le bloquant passe devant, le sans-échéance en dernier', () => {
    const urgences = classerUrgences(
      aTraiter({
        brouillons: 2,
        messagesNonLus: 9,
        equipesSansLien: 1,
        equipesSansLienNoms: ['-18F'],
        echeances: { plusAncienMessage: jours(-3), plusAncienScore: null },
      }),
      maintenant
    )
    expect(urgences.map((u) => u.id)).toEqual(['equipes', 'messages', 'brouillons'])
    expect(urgences[0].echeance).toEqual({ texte: 'Bloquant', tone: 'bad' })
    expect(urgences[0].detail).toContain('-18F')
  })

  test("un score attendu depuis plus de deux jours passe avant les messages récents", () => {
    const urgences = classerUrgences(
      aTraiter({
        messagesNonLus: 1,
        scoresEnAttente: 2,
        echeances: { plusAncienMessage: jours(-1), plusAncienScore: jours(-4) },
      }),
      maintenant
    )
    expect(urgences.map((u) => u.id)).toEqual(['scores', 'messages'])
    expect(urgences[0].urgent).toBe(true)
    expect(urgences[0].libelle).toBe('scores en attente')
  })
})

describe('notes d’arbitrage', () => {
  test('une note récente reste neutre, une note de plus de 7 jours devient urgente', () => {
    const recente = classerUrgences(aTraiter({ notesArbitrage: 1, plusAncienneNoteArbitrage: jours(-2) }), maintenant)
    expect(recente).toHaveLength(1)
    expect(recente[0]).toMatchObject({ id: 'arbitrage', href: '/admin/arbitrage', urgent: false })
    expect(recente[0].echeance.tone).toBe('neutral')

    const ancienne = classerUrgences(aTraiter({ notesArbitrage: 2, plusAncienneNoteArbitrage: jours(-9) }), maintenant)
    expect(ancienne[0]).toMatchObject({ id: 'arbitrage', nombre: 2, urgent: true })
    expect(ancienne[0].echeance.tone).toBe('action')
  })
})
