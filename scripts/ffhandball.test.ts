import { describe, expect, test } from 'bun:test'
import {
  analyserUrl,
  cleEquipe,
  equipesDuClub,
  extraireComposants,
  libelleSalle,
  lireCalendrierEquipe,
  lireDate,
  lireSalle,
  lireScores,
  mettreEnForme,
  slugFfhb,
  trouverExistant,
  versMatch,
  type RencontreFfhb,
} from '../src/lib/ffhandball/donnees'

/** Reproduit l'encodage du site : JSON échappé en entités HTML dans `attributes`. */
function bloc(nom: string, donnees: unknown): string {
  const attributs = JSON.stringify(donnees)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
  return `<smartfire-component name='${nom}' attributes="${attributs}"></smartfire-component>`
}

const AIX = { id: '100', ext_equipeId: '900', pouleId: '50', structureId: '983', libelle: 'HBC AIX EN SAVOIE  2' }
const AUTRE_AIX = { id: '101', ext_equipeId: '901', pouleId: '51', structureId: '983', libelle: 'HBC AIX EN SAVOIE 3' }

function rencontre(partiel: Record<string, unknown>) {
  return {
    ext_rencontreId: '1',
    equipe1Id: '100',
    equipe2Id: '200',
    equipe1Libelle: 'HBC AIX EN SAVOIE  2',
    equipe2Libelle: "MONTMELI'HAND   1",
    equipe1Score: null,
    equipe2Score: null,
    date: '2026-11-22T11:00:00+01:00',
    equipementId: '886',
    journeeNumero: '4',
    structure1Logo: 'aix.png',
    structure2Logo: '2026-06-29-03c4071f.png',
    extPouleId: '195426',
    ...partiel,
  }
}

const PAGE_EQUIPE = [
  bloc('page-header', { title: 'MOINS DE 11 ANS MIXTE 1 ERE PHASE' }),
  bloc('competitions---poule-selector', {
    selected_equipe: AIX,
    equipe_options: [AIX, { ...AUTRE_AIX, structureId: '983' }, { id: '200', ext_equipeId: '902', structureId: '12', libelle: 'AUTRE CLUB' }],
  }),
  bloc('competitions---rencontre-list', {
    rencontres: [
      rencontre({ ext_rencontreId: '1' }),
      rencontre({
        ext_rencontreId: '2',
        equipe1Id: '300',
        equipe2Id: '100',
        equipe1Libelle: 'SAINT GENIX-AOSTE  1',
        equipe2Libelle: 'HBC AIX EN SAVOIE  2',
        equipe1Score: '8',
        equipe2Score: '16',
        structure1Logo: 'genix.PNG',
      }),
      // Rencontre d'une autre équipe du club, listée sur la même page
      rencontre({ ext_rencontreId: '3', equipe1Id: '101', equipe2Id: '400' }),
      rencontre({ ext_rencontreId: '4', date: null }),
    ],
  }),
  bloc('competitions---mini-classement-or-ads', {
    classements: [
      { pouleId: '50', place: '1', point: '18', equipe_libelle: "HANDBALL CLUB COURNON D'AUVERGNE" },
      { pouleId: '99', place: '1', point: '12', equipe_libelle: 'AUTRE POULE' },
    ],
  }),
].join('\n')

describe('liens FFHandball', () => {
  const base = 'https://www.ffhandball.fr/competitions/saison-2026-2027-22/regional/excellence-masculin-aura-30497'

  test('reconnaît un lien de compétition, de poule et d’équipe', () => {
    expect(analyserUrl(`${base}/`)).toEqual({ racine: base, extPouleId: null, extEquipeId: null })
    expect(analyserUrl(`${base}/poule-190160/journee-3/`)).toEqual({
      racine: base,
      extPouleId: '190160',
      extEquipeId: null,
    })
    expect(analyserUrl(`${base}/equipe-2117212/`)?.extEquipeId).toBe('2117212')
  })

  test('refuse tout autre site ou chemin', () => {
    expect(analyserUrl('https://evil.example/competitions/saison-2026-2027-22/regional/x-1/')).toBeNull()
    expect(analyserUrl(`http://www.ffhandball.fr${new URL(base).pathname}/`)).toBeNull()
    expect(analyserUrl('https://www.ffhandball.fr/actualites/')).toBeNull()
    expect(analyserUrl('pas une url')).toBeNull()
  })

  test('construit le même segment d’URL que le site', () => {
    expect(slugFfhb('M13 ANS MASCULIN  DIVISION 1 AURA')).toBe('m13-ans-masculin-division-1-aura')
    expect(slugFfhb('1ERE DIVISION FEMININE P16 AURA')).toBe('1ere-division-feminine-p16-aura')
    expect(slugFfhb('Comité de Savoie')).toBe('comite-de-savoie')
  })
})

describe('lecture des pages', () => {
  test('décode les blocs et ignore ceux qui sont illisibles', () => {
    const page = `${bloc('competitions---a', { texte: "L'été & l'hiver" })}<smartfire-component name='competitions---b' attributes="{pas du json">`
    const composants = extraireComposants(page)
    expect(composants.get('competitions---a')).toEqual({ texte: "L'été & l'hiver" })
    expect(composants.has('competitions---b')).toBe(false)
  })

  test('ne garde que les rencontres de l’équipe demandée', () => {
    const calendrier = lireCalendrierEquipe(extraireComposants(PAGE_EQUIPE))
    expect(calendrier.competition).toBe('Moins de 11 Ans Mixte 1 Ere Phase')
    expect(calendrier.equipe.libelle).toBe('HBC AIX EN SAVOIE 2')
    expect(calendrier.rencontres.map((r) => r.extRencontreId)).toEqual(['1', '2', '4'])
  })

  test('lit adversaire, côté, score et logo', () => {
    const [recue, deplacement, sansDate] = lireCalendrierEquipe(extraireComposants(PAGE_EQUIPE)).rencontres
    expect(recue).toMatchObject({
      recoit: true,
      adversaire: "MONTMELI'HAND 1",
      termine: false,
      journee: 4,
      logoAdversaire: 'https://media-logos-clubs.ffhandball.fr/64/2026-06-29-03c4071f.webp',
    })
    expect(recue.date?.toISOString()).toBe('2026-11-22T10:00:00.000Z')
    expect(deplacement).toMatchObject({
      recoit: false,
      adversaire: 'SAINT GENIX-AOSTE 1',
      scoreEquipe: 16,
      scoreAdversaire: 8,
      termine: true,
    })
    expect(sansDate.date).toBeNull()
  })

  test('garde le classement de la poule de l’équipe', () => {
    expect(lireCalendrierEquipe(extraireComposants(PAGE_EQUIPE)).classement).toEqual([
      { position: 1, club: "HANDBALL CLUB COURNON D'AUVERGNE", points: 18 },
    ])
  })

  test('repère les équipes du club dans une poule', () => {
    expect(equipesDuClub(extraireComposants(PAGE_EQUIPE)).map((e) => e.extEquipeId)).toEqual(['900', '901'])
  })

  test('refuse une page qui affiche une autre équipe ou un autre club', () => {
    const composants = extraireComposants(PAGE_EQUIPE)
    expect(() => lireCalendrierEquipe(composants, '900')).not.toThrow()
    expect(() => lireCalendrierEquipe(composants, '555')).toThrow(/autre équipe/)

    const adverse = PAGE_EQUIPE.replace(
      bloc('competitions---poule-selector', {
        selected_equipe: AIX,
        equipe_options: [AIX, { ...AUTRE_AIX, structureId: '983' }, { id: '200', ext_equipeId: '902', structureId: '12', libelle: 'AUTRE CLUB' }],
      }),
      bloc('competitions---poule-selector', { selected_equipe: { ...AIX, structureId: '12', libelle: 'AUTRE CLUB' } })
    )
    expect(() => lireCalendrierEquipe(extraireComposants(adverse))).toThrow(/autre club/)
  })

  test('une page sans liste de rencontres est une erreur, pas un calendrier vide', () => {
    const page = bloc('competitions---poule-selector', { selected_equipe: AIX })
    expect(() => lireCalendrierEquipe(extraireComposants(page))).toThrow(/liste des rencontres/)
  })

  test('un classement absent ou partiel n’est pas lu comme un classement vide', () => {
    const sans = [
      bloc('competitions---poule-selector', { selected_equipe: AIX }),
      bloc('competitions---rencontre-list', { rencontres: [] }),
    ].join('')
    expect(lireCalendrierEquipe(extraireComposants(sans)).classement).toBeNull()
    expect(lireCalendrierEquipe(extraireComposants(sans)).competition).toBeNull()

    const partiel = sans + bloc('competitions---mini-classement-or-ads', {
      classements: [
        { pouleId: '50', place: '1', point: '18', equipe_libelle: 'CLUB A' },
        { pouleId: '50', place: null, point: '12', equipe_libelle: 'CLUB B' },
      ],
    })
    expect(lireCalendrierEquipe(extraireComposants(partiel)).classement).toBeNull()

    const vide = sans + bloc('competitions---mini-classement-or-ads', { classements: [] })
    expect(lireCalendrierEquipe(extraireComposants(vide)).classement).toEqual([])
  })

  test('échoue clairement si la page ne désigne aucune équipe', () => {
    expect(() => lireCalendrierEquipe(extraireComposants(bloc('competitions---poule-selector', { selected_equipe: null })))).toThrow(
      /aucune équipe/
    )
  })

  test('lit la salle d’une rencontre', () => {
    const page = bloc('competitions---rencontre-salle', {
      equipement: { id: '886', libelle: 'GYMNASE DES PRES RIANTS', rue: '7  RUE DES PRES RIANTS', codePostal: '73100', ville: 'AIX LES BAINS' },
    })
    expect(lireSalle(extraireComposants(page))).toEqual({
      id: '886',
      libelle: 'GYMNASE DES PRES RIANTS',
      rue: '7 RUE DES PRES RIANTS',
      codePostal: '73100',
      ville: 'AIX LES BAINS',
    })
    expect(lireSalle(extraireComposants(bloc('competitions---rencontre-salle', { equipement: null })))).toBeNull()
  })
})

describe('dates', () => {
  test('un match placé à minuit par la fédération n’a pas encore de date', () => {
    expect(lireDate('2026-12-31T00:00:00+01:00')).toBeNull()
    expect(lireDate('2026-07-01T00:00:00+02:00')).toBeNull()
    expect(lireDate('2026-11-14T21:00:00+01:00')?.toISOString()).toBe('2026-11-14T20:00:00.000Z')
    expect(lireDate(null)).toBeNull()
    expect(lireDate('pas une date')).toBeNull()
    // Sans décalage explicite, l'heure dépendrait de la machine : refusée
    expect(lireDate('2026-11-14 21:00:00.000')).toBeNull()
    expect(lireDate('2026-11-14T20:00:00Z')?.toISOString()).toBe('2026-11-14T20:00:00.000Z')
  })
})

describe('scores', () => {
  test('un score manquant laisse le match à jouer', () => {
    expect(lireScores(null, null)).toEqual({ scoreEquipe: null, scoreAdversaire: null, termine: false })
    expect(lireScores('12', null).termine).toBe(false)
  })

  test('un forfait compte zéro but', () => {
    expect(lireScores('10', 'FO')).toEqual({ scoreEquipe: 10, scoreAdversaire: 0, termine: true })
    expect(lireScores('FO', '10')).toEqual({ scoreEquipe: 0, scoreAdversaire: 10, termine: true })
  })
})

describe('conversion en match', () => {
  const base: RencontreFfhb & { date: Date } = {
    extRencontreId: '1',
    extPouleId: '195426',
    journee: 1,
    date: new Date('2026-10-11T08:00:00Z'),
    equipementId: '886',
    recoit: false,
    adversaire: 'US ALBENS HANDBALL 1',
    logoAdversaire: null,
    scoreEquipe: 1,
    scoreAdversaire: 1,
    termine: true,
  }
  const presRiants = { id: '886', libelle: 'GYMNASE DES PRES RIANTS', rue: null, codePostal: '73100', ville: 'AIX LES BAINS' }
  const mende = { id: '221', libelle: 'HALLE DES SPORTS', rue: null, codePostal: '48000', ville: 'MENDE' }

  test('en plateau, le domicile vient de la salle et le « 1 - 1 » fédéral n’est pas un score', () => {
    const match = versMatch(base, presRiants, 'Moins de 11', true)
    expect(match).toMatchObject({
      domicile: true,
      lieu: 'Gymnase des Prés Riants',
      scoreEquipe: null,
      scoreAdversaire: null,
      termine: true,
    })
    expect(versMatch({ ...base, recoit: true }, mende, 'Moins de 11', true).domicile).toBe(false)
  })

  test('en plateau, un vrai score est conservé', () => {
    const match = versMatch({ ...base, scoreEquipe: 16, scoreAdversaire: 8 }, mende, 'Moins de 11', true)
    expect(match).toMatchObject({ scoreEquipe: 16, scoreAdversaire: 8, termine: true })
  })

  test('hors plateau, le domicile vient de l’ordre des équipes et le score est gardé', () => {
    const match = versMatch({ ...base, recoit: true }, mende, 'Nationale 3', false)
    expect(match).toMatchObject({ domicile: true, lieu: 'Halle des Sports, Mende', scoreEquipe: 1, scoreAdversaire: 1 })
  })

  test('sans salle connue, le lieu reste à déterminer et le domicile n’est pas fiable', () => {
    const match = versMatch(base, null, 'Moins de 11', true)
    expect(match.lieu).toBe('À déterminer')
    expect(match.domicileFiable).toBe(false)
    expect(versMatch(base, presRiants, 'Moins de 11', true).domicileFiable).toBe(true)
    expect(versMatch(base, null, 'Nationale 3', false).domicileFiable).toBe(true)
  })

  test('une salle d’une commune voisine au même code postal n’est pas à domicile', () => {
    const gresy = { id: '9', libelle: 'GYMNASE', rue: null, codePostal: '73100', ville: 'GRESY SUR AIX' }
    const tresserve = { id: '10', libelle: 'GYMNASE', rue: null, codePostal: '73100', ville: 'TRESSERVE' }
    expect(versMatch(base, tresserve, 'Moins de 11', true).domicile).toBe(false)
    expect(versMatch(base, gresy, 'Moins de 11', true).domicile).toBe(false)
  })

  test('met en forme salles et compétitions', () => {
    expect(mettreEnForme("HALLE DE L'ISLE D'ABEAU")).toBe("Halle de l'Isle d'Abeau")
    expect(mettreEnForme('M15 ANS MASCULIN EXCELLENCE AURA')).toBe('M15 Ans Masculin Excellence Aura')
    expect(mettreEnForme('SAINT-GENIX SUR GUIERS')).toBe('Saint-Genix sur Guiers')
    expect(libelleSalle({ id: '1', libelle: 'GYMNASE MARLIOZ', rue: null, codePostal: '73100', ville: 'AIX LES BAINS' })).toBe(
      'Gymnase de Marlioz'
    )
  })
})

describe('rapprochement avec la base', () => {
  const existants = [
    { id: 1, adversaire: 'US ALBENS HANDBALL  2', date: new Date('2026-11-08T09:00:00Z'), extRencontreId: null },
    { id: 2, adversaire: 'US ALBENS HANDBALL 2', date: new Date('2026-12-06T09:00:00Z'), extRencontreId: null },
    { id: 3, adversaire: 'HBC SALLANCHES SÉNIORS FÉMININES', date: new Date('2026-10-10T19:00:00Z'), extRencontreId: null },
    { id: 4, adversaire: 'CHEYENNE HB', date: new Date('2026-11-14T20:00:00Z'), extRencontreId: 'R4' },
  ]

  test('ignore casse, accents et espaces dans le nom', () => {
    expect(cleEquipe('HBC SALLANCHES SÉNIORS FÉMININES')).toBe(cleEquipe('hbc sallanches  seniors feminines'))
    const trouve = trouverExistant(
      existants,
      { adversaire: 'US ALBENS HANDBALL 2', date: new Date('2026-11-08T10:00:00Z'), extRencontreId: 'R1' },
      new Set()
    )
    expect(trouve?.id).toBe(1)
  })

  test('ne rapproche pas au-delà d’un jour ni deux fois le même match', () => {
    const cible = { adversaire: 'US ALBENS HANDBALL 2', date: new Date('2026-11-20T10:00:00Z'), extRencontreId: 'R1' }
    expect(trouverExistant(existants, cible, new Set())).toBeNull()
    const proche = { adversaire: 'US ALBENS HANDBALL 2', date: new Date('2026-12-06T10:00:00Z'), extRencontreId: 'R2' }
    expect(trouverExistant(existants, proche, new Set([2]))).toBeNull()
  })

  test('un match relié suit sa rencontre : report de plusieurs semaines ou adversaire renommé', () => {
    const reporte = { adversaire: 'CHEYENNE HB', date: new Date('2026-12-19T19:30:00Z'), extRencontreId: 'R4' }
    expect(trouverExistant(existants, reporte, new Set())?.id).toBe(4)
    const renomme = { adversaire: 'ENTENTE CHEYENNE / YENNE', date: new Date('2026-11-14T20:00:00Z'), extRencontreId: 'R4' }
    expect(trouverExistant(existants, renomme, new Set())?.id).toBe(4)
  })

  test('un match relié à une autre rencontre n’est jamais réattribué', () => {
    // Match retour contre le même adversaire, programmé le lendemain du match aller déjà relié
    const retour = { adversaire: 'CHEYENNE HB', date: new Date('2026-11-15T10:00:00Z'), extRencontreId: 'R11' }
    expect(trouverExistant(existants, retour, new Set())).toBeNull()
  })
})
