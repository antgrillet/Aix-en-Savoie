import { describe, expect, test } from 'bun:test'
import {
  bornesSemaine,
  estCategoriePlateau,
  issueMatch,
  libelleLieu,
  lireSemaine,
  regrouperRencontres,
  semaineParDefaut,
  type MatchResultat,
} from '../src/lib/resultats-weekend'

function match(partiel: Partial<MatchResultat> & Pick<MatchResultat, 'id' | 'date'>): MatchResultat {
  return {
    adversaire: 'ADVERSAIRE',
    lieu: 'À déterminer',
    domicile: true,
    scoreEquipe: null,
    scoreAdversaire: null,
    termine: false,
    ...partiel,
  }
}

describe('semaine affichée', () => {
  test('du lundi au mercredi, on reste sur le week-end passé', () => {
    // Mardi 10 novembre 2026
    expect(semaineParDefaut(new Date('2026-11-10T09:00:00Z'))).toBe('2026-11-02')
    // Mercredi 11 novembre 2026, 23h30 à Paris
    expect(semaineParDefaut(new Date('2026-11-11T22:30:00Z'))).toBe('2026-11-02')
  })

  test('à partir du jeudi, on passe au week-end à venir', () => {
    // Jeudi 12 novembre 2026, 00h30 à Paris (encore mercredi en UTC)
    expect(semaineParDefaut(new Date('2026-11-11T23:30:00Z'))).toBe('2026-11-09')
    // Dimanche 15 novembre 2026
    expect(semaineParDefaut(new Date('2026-11-15T18:00:00Z'))).toBe('2026-11-09')
  })

  test('le paramètre est ramené au lundi, une valeur invalide est ignorée', () => {
    const maintenant = new Date('2026-11-10T09:00:00Z')
    expect(lireSemaine('2026-10-24', maintenant)).toBe('2026-10-19')
    expect(lireSemaine('2026-02-31', maintenant)).toBe('2026-11-02')
    expect(lireSemaine("2026-11-09'; --", maintenant)).toBe('2026-11-02')
    expect(lireSemaine(undefined, maintenant)).toBe('2026-11-02')
  })

  test('les bornes suivent minuit à Paris, changement d’heure compris', () => {
    // Semaine du 19 octobre 2026 : retour à l'heure d'hiver le dimanche 25
    const bornes = bornesSemaine('2026-10-19')
    expect(bornes.debut.toISOString()).toBe('2026-10-18T22:00:00.000Z')
    expect(bornes.fin.toISOString()).toBe('2026-10-25T23:00:00.000Z')
    expect(bornes.samedi).toBe('2026-10-24')
    expect(bornes.dimanche).toBe('2026-10-25')
  })
})

describe('plateaux', () => {
  test('reconnaît les catégories jouées en plateau', () => {
    expect(estCategoriePlateau('-11M')).toBe(true)
    expect(estCategoriePlateau('-9')).toBe(true)
    expect(estCategoriePlateau('-13 DIVISION')).toBe(false)
    expect(estCategoriePlateau('N3M')).toBe(false)
  })

  test('regroupe les deux matchs joués au même endroit le même jour', () => {
    const rencontres = regrouperRencontres(
      [
        match({ id: 2, date: new Date('2026-11-14T14:30:00Z'), lieu: 'GYMNASE DE MARLIOZ' }),
        match({ id: 1, date: new Date('2026-11-14T13:00:00Z'), lieu: 'Gymnase de Marlioz' }),
        match({ id: 3, date: new Date('2026-11-15T09:00:00Z'), lieu: 'Gymnase de Marlioz' }),
      ],
      true
    )
    expect(rencontres).toHaveLength(2)
    expect(rencontres[0].matchs.map((m) => m.id)).toEqual([1, 2])
    expect(rencontres[0].date.toISOString()).toBe('2026-11-14T13:00:00.000Z')
    expect(rencontres[1].matchs.map((m) => m.id)).toEqual([3])
  })

  test('un match dont la salle manque rejoint le plateau du jour', () => {
    const [plateau] = regrouperRencontres(
      [
        match({ id: 1, date: new Date('2026-11-14T13:00:00Z'), lieu: 'À déterminer', domicile: false }),
        match({ id: 2, date: new Date('2026-11-14T13:00:00Z'), lieu: 'Gymnase des Prés Riants', domicile: true }),
      ],
      true
    )
    expect(plateau.matchs).toHaveLength(2)
    expect(plateau.lieu).toBe('Gymnase des Prés Riants')
    expect(plateau.domicile).toBe(true)
  })

  test('hors plateau, chaque match reste une rencontre à part', () => {
    const rencontres = regrouperRencontres(
      [
        match({ id: 1, date: new Date('2026-11-14T13:00:00Z') }),
        match({ id: 2, date: new Date('2026-11-14T15:00:00Z') }),
      ],
      false
    )
    expect(rencontres).toHaveLength(2)
  })
})

describe('issue et salle', () => {
  test('donne l’issue vue du club', () => {
    expect(issueMatch({ scoreEquipe: 34, scoreAdversaire: 28, termine: true })).toBe('victoire')
    expect(issueMatch({ scoreEquipe: 20, scoreAdversaire: 20, termine: true })).toBe('nul')
    expect(issueMatch({ scoreEquipe: 18, scoreAdversaire: 25, termine: true })).toBe('defaite')
    expect(issueMatch({ scoreEquipe: null, scoreAdversaire: null, termine: false })).toBeNull()
    expect(issueMatch({ scoreEquipe: 3, scoreAdversaire: 1, termine: false })).toBeNull()
  })

  test('normalise les deux gymnases du club', () => {
    expect(libelleLieu('GYMNASE DES PRES RIANTS', true)).toBe('Gymnase des Prés Riants')
    expect(libelleLieu('Gymnase du Pré-Riant', true)).toBe('Gymnase des Prés Riants')
    expect(libelleLieu('GYMNASE MARLIOZ', true)).toBe('Gymnase de Marlioz')
    expect(libelleLieu('HALLE DES SPORTS DE MENDE', false)).toBe('HALLE DES SPORTS DE MENDE')
  })

  test('signale une salle encore inconnue', () => {
    expect(libelleLieu('À déterminer', true)).toBe('Salle à confirmer')
    expect(libelleLieu('', false)).toBe('Lieu à confirmer')
    expect(libelleLieu('Plateau', false)).toBe('Lieu à confirmer')
  })
})
