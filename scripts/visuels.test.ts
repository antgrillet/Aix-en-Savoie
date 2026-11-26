import { describe, expect, test } from 'bun:test'
import {
  codeEquipe,
  composerGameDay,
  composerWeekend,
  couleurParDefaut,
  estEquipePlateau,
  libelleCompetition,
  libelleSalle,
  lireCouleur,
  nomCourt,
  legende,
  libelleHoraire,
  logoGrand,
  LONGUEUR_NOM,
  photoGameDayAutorisee,
  repartirColonnes,
  titreWeekend,
  type MatchVisuel,
} from '../src/lib/visuels/composition'

// Lundi 16 novembre 2026 : week-end des 21-22 novembre
const LUNDI = '2026-11-16'
let id = 0
const equipes = new Map<string, number>()
const idEquipe = (nom: string) => equipes.get(nom) ?? (equipes.set(nom, equipes.size + 1), equipes.size)
function match(nom: string, categorie: string, date: string, partiel: Partial<MatchVisuel> = {}): MatchVisuel {
  id++
  return {
    id,
    adversaire: `ADV ${id}`,
    date: new Date(date),
    lieu: 'Gymnase',
    domicile: true,
    scoreEquipe: null,
    scoreAdversaire: null,
    termine: false,
    logoAdversaire: `https://media-logos-clubs.ffhandball.fr/64/logo-${id}.webp`,
    equipe: { id: idEquipe(nom), nom, categorie, ordre: idEquipe(nom) },
    ...partiel,
  }
}

describe('codeEquipe', () => {
  test.each([
    ['SENIORS MASCULINS 1', 'SM1'],
    ['SENIORS FEMININES 2', 'SF2'],
    ['Seniors Féminines 1', 'SF1'],
    ['-18.1M', 'U18.1M'],
    ['-18F', 'U18F'],
    ['-15.2F', 'U15.2F'],
    ['-13.1M', 'U13.1M'],
    ['-11.3M', 'U11.3'],
    ['-11F', 'U11F'],
    ['-9', 'U9'],
    ['U11.2M', 'U11.2'],
    ['−11.1M', 'U11.1'],
    ['–11M', 'U11'],
    ['U13M', 'U13M'],
  ])('%s → %s', (nom, code) => expect(codeEquipe(nom)).toBe(code))

  test.each([
    ['-11.2M', '', true],
    ['U11.2M', 'Moins de 11 ans', true],
    ['−11F', '', true],
    ['–9', '', true],
    ['EQUIPE', 'U11', true],
    ['-13.1M', '-13 ans', false],
    ['U13M', '', false],
  ])('plateau %s (%s) : %p', (nom, categorie, plateau) => expect(estEquipePlateau({ nom, categorie })).toBe(plateau))
})

describe('libellés', () => {
  test('horaire à l’heure de Paris', () => {
    expect(libelleHoraire(new Date('2026-11-21T19:00:00Z'))).toBe('SAMEDI 20H00')
    expect(libelleHoraire(new Date('2026-11-22T09:00:00Z'))).toBe('DIMANCHE 10H00')
  })
  test('titre du week-end, y compris à cheval sur deux mois', () => {
    expect(titreWeekend(LUNDI)).toBe('WEEKEND DU 21-22 NOVEMBRE')
    expect(titreWeekend('2026-10-26')).toBe('WEEKEND DU 31 OCTOBRE-1 NOVEMBRE')
  })
  test('logo en 512 px', () => {
    expect(logoGrand('https://media-logos-clubs.ffhandball.fr/64/a.webp')).toBe('https://media-logos-clubs.ffhandball.fr/512/a.webp')
    expect(logoGrand(null)).toBeNull()
  })
})

describe('repartirColonnes', () => {
  test.each([
    [6, 4, 2],
    [8, 5, 3],
    [5, 4, 1],
    [10, 5, 5],
    [1, 1, 0],
  ])('%i lignes → %i + %i', (n, g, d) => {
    const [gauche, droite] = repartirColonnes(Array.from({ length: n }, (_, i) => i))
    expect([gauche.length, droite.length]).toEqual([g, d])
  })
})

describe('composerWeekend', () => {
  const matchs = [
    match('SENIORS MASCULINS 1', 'Seniors', '2026-11-21T18:00:00Z', { termine: true, scoreEquipe: 37, scoreAdversaire: 27 }),
    match('SENIORS FEMININES 1', 'Seniors', '2026-11-21T20:00:00Z', { domicile: false, termine: true, scoreEquipe: 28, scoreAdversaire: 27 }),
    match('-11.2M', '-11 ans', '2026-11-22T10:00:00Z', { domicile: false, termine: true, scoreEquipe: 10, scoreAdversaire: 12 }),
    match('-11.2M', '-11 ans', '2026-11-22T11:00:00Z', { domicile: false, termine: true, scoreEquipe: 14, scoreAdversaire: 8 }),
    match('-13.1M', '-13 ans', '2026-11-21T11:00:00Z'),
    // Hors week-end : ignoré
    match('SENIORS MASCULINS 2', 'Seniors', '2026-11-18T19:00:00Z'),
    // Vendredi soir : hors samedi-dimanche aussi
    match('SENIORS MASCULINS 2', 'Seniors', '2026-11-20T19:30:00Z'),
  ]
  const maintenant = new Date('2026-11-23T08:00:00Z')

  test('planning : pages domicile et extérieur, plateau regroupé', () => {
    const { pages } = composerWeekend(matchs, LUNDI, 'planning', maintenant)
    expect(pages.map((p) => p.cote)).toEqual(['domicile', 'exterieur'])
    expect(pages[0].colonnes.flat().map((l) => l.code)).toEqual(['SM1', 'U13.1M'])
    const ext = pages[1].colonnes.flat()
    expect(ext.map((l) => l.code)).toEqual(['SF1', 'U11.2'])
    expect(ext[1].logos).toHaveLength(2)
    expect(ext[1].horaire).toBe('DIMANCHE 11H00')
  })

  test('résultat : score du club en gras, ordre recevant d’abord, bilan de plateau', () => {
    const { pages, sansScore } = composerWeekend(matchs, LUNDI, 'resultat', maintenant)
    const [sm1] = pages[0].colonnes.flat()
    expect(sm1.resultat).toEqual({ signe: 'victoire', gauche: '37', droite: '27', gras: 'gauche', plateau: false })
    const [sf1, u11] = pages[1].colonnes.flat()
    expect(sf1.resultat).toEqual({ signe: 'victoire', gauche: '27', droite: '28', gras: 'droite', plateau: false })
    expect(u11.resultat).toEqual({ signe: 'nul', gauche: '1', droite: '1', gras: null, plateau: true })
    expect(sansScore.map((s) => s.code)).toEqual(['U13.1M'])
  })

  test('résultat : un plateau joué sans score reste affiché, sans bilan', () => {
    const plateau = [match('-11F', '-11 ans', '2026-11-21T09:00:00Z', { domicile: false })]
    const { pages, sansScore } = composerWeekend(plateau, LUNDI, 'resultat', maintenant)
    expect(pages[0].colonnes[0][0].resultat).toEqual({ signe: 'nul', gauche: '', droite: '', gras: null, plateau: true })
    expect(sansScore).toEqual([])
  })

  test('matchs hors samedi-dimanche signalés, pas sur les visuels', () => {
    for (const gabarit of ['planning', 'resultat'] as const) {
      const { pages, horsWeekend } = composerWeekend(matchs, LUNDI, gabarit, maintenant)
      expect(pages.flatMap((p) => p.colonnes.flat()).map((l) => l.code)).not.toContain('SM2')
      expect(horsWeekend.map((h) => [h.equipe, h.date.toISOString()])).toEqual([
        ['SENIORS MASCULINS 2', '2026-11-18T19:00:00.000Z'],
        ['SENIORS MASCULINS 2', '2026-11-20T19:30:00.000Z'],
      ])
    }
  })

  test('plateau écrit « U11 » : regroupé comme « -11 »', () => {
    const plateau = [
      match('U11.1M', 'Moins de 11 ans', '2026-11-22T09:00:00Z', { domicile: false }),
      match('U11.1M', 'Moins de 11 ans', '2026-11-22T10:00:00Z', { domicile: false }),
    ]
    const lignes = composerWeekend(plateau, LUNDI, 'planning', maintenant).pages.flatMap((p) => p.colonnes.flat())
    expect(lignes.map((l) => [l.code, l.logos.length])).toEqual([['U11.1', 2]])
  })

  test('au-delà de dix lignes, une seconde page', () => {
    const beaucoup = Array.from({ length: 12 }, (_, i) =>
      match(`-15.${i + 1}M`, '-15 ans', '2026-11-21T10:00:00Z', { equipe: { id: 1000 + i, nom: `-15.${i + 1}M`, categorie: '-15', ordre: i } })
    )
    const { pages } = composerWeekend(beaucoup, LUNDI, 'planning', maintenant)
    expect(pages.map((p) => [p.numero, p.colonnes[0].length + p.colonnes[1].length])).toEqual([[1, 10], [2, 2]])
  })

  test('légende prête à coller', () => {
    const texte = legende(composerWeekend(matchs, LUNDI, 'resultat', maintenant), 'resultat')
    expect(texte).toContain('Résultats du week-end du 21-22 novembre')
    expect(texte).toContain('SM1 ✅ 37-27')
  })
})

describe('Game Day', () => {
  test.each([
    ['ASSOCIATION SPORTIVE HANDBALL CLUB DE CHALON', 'CHALON'],
    ['ANNECY HANDBALL', 'ANNECY'],
    ['HANDBALL CLUB DE LA FILLIERE', 'FILLIERE'],
    ['VAL DE LEYSSE HANDBALL', 'VAL DE LEYSSE'],
    ['OYONNAX US HANDBALL', 'OYONNAX'],
    ['P16F PNF - TEAM SALEVE', 'SALEVE'],
    ['HBC SALLANCHES Séniors Masculins', 'SALLANCHES'],
    ['ARLESIEN', 'ARLES'],
    ['MENDE GEVAUDAN', 'MENDE'],
    ['U18 CHAMBE', 'CHAMBE'],
    ['M13M HBCG FERNEY-VOLTAIRE', 'HBCG FERNEY-VOLTAIRE'],
    // L'article de tête ne tombe que derrière un mot retiré
    ['LA MOTTE SERVOLEX HANDBALL', 'LA MOTTE SERVOLEX'],
    ['LE BOURGET DU LAC HANDBALL', 'LE BOURGET DU LAC'],
    // Pas de nom qui finit sur « EN »
    ['ST JULIEN EN GENEVOIS', 'ST JULIEN EN GENEVOIS'],
    ['HANDBALL CLUB DE SAINT JULIEN EN GENEVOIS', 'SAINT JULIEN EN GENEVOIS'],
    ['ENTENTE ST MARTIN SUR LA CHAMBRE', 'ST MARTIN SUR LA CHAMBRE'],
    ['ST MARTIN SUR LA CHAMBRE HBC SAVOIE', 'ST MARTIN SUR LA CHAMBRE'],
  ])('nom court de %s', (nom, court) => expect(nomCourt(nom)).toBe(court))

  test.each([
    'ASSOCIATION SPORTIVE HANDBALL CLUB DE SAINT-MARTIN-D-HERES-ET-ENVIRONS',
    'CHAMBERY SAVOIE MONT BLANC HANDBALL',
    'HANDBALL CLUB DES PAYS DE SAVOIE ET DU LEMAN',
  ])('nom court de %s : jamais plus de 24 caractères', (nom) => {
    expect(nomCourt(nom).length).toBeLessThanOrEqual(LONGUEUR_NOM)
  })

  test.each([
    ['Nationale 3 Masculine 2026-2027', 'NATIONALE 3 MASCULINE'],
    ['Prenationale Feminine Aura', 'PRÉNATIONALE FÉMININE'],
    ['1ere Division Feminine P16 Aura', '1ÈRE DIVISION FÉMININE'],
    [null, ''],
  ])('compétition %s', (brut, libelle) => expect(libelleCompetition(brut)).toBe(libelle))

  test('le club qui reçoit est à gauche', () => {
    const base = { adversaire: 'ASSOCIATION SPORTIVE HANDBALL CLUB DE CHALON', date: new Date('2026-11-28T19:00:00Z'), lieu: 'La Verrerie, Chalon sur Saone', logoAdversaire: 'https://media-logos-clubs.ffhandball.fr/64/c.webp', competition: 'Nationale 3 Masculine 2026-2027' }
    const exterieur = composerGameDay({ ...base, domicile: false })
    expect(exterieur.gauche).toEqual({ nom: 'CHALON', logo: 'https://media-logos-clubs.ffhandball.fr/512/c.webp', club: false })
    expect(exterieur.droite.club).toBe(true)
    expect(exterieur).toMatchObject({ jour: ['SAMEDI 28', 'NOVEMBRE'], heure: '20H00', salle: 'SALLE LA VERRERIE', info: '', competition: 'NATIONALE 3 MASCULINE' })
    expect(composerGameDay({ ...base, domicile: true }, { nomAdversaire: 'Chalon-sur-Saône' }).droite.nom).toBe('CHALON-SUR-SAÔNE')
  })

  test('salle et entrée payante comme sur les affiches du club', () => {
    const base = { adversaire: 'ARLESIEN', date: new Date('2026-11-21T18:00:00Z'), lieu: 'Gymnase des Prés Riants', logoAdversaire: null, domicile: true }
    const n3 = composerGameDay({ ...base, competition: 'Nationale 3 Masculine 2026-2027' })
    expect(n3).toMatchObject({ salle: 'GYMNASE DES PRÉS RIANTS', info: 'ENTRÉE PAYANTE : 3€' })
    expect(composerGameDay({ ...base, competition: 'Nationale 3 Masculine 2026-2027' }, { info: '' }).info).toBe('')
    expect(composerGameDay({ ...base, competition: 'Prenationale Feminine Aura' }).info).toBe('')
  })

  test('couleur par défaut : rose en Coupe, bleu à domicile, orange dehors', () => {
    expect(couleurParDefaut({ domicile: true, competition: 'Coupe de France Regionale' })).toBe('rose')
    expect(couleurParDefaut({ domicile: true, competition: 'Nationale 3 Masculine' })).toBe('bleu')
    expect(couleurParDefaut({ domicile: false, competition: 'Nationale 3 Masculine' })).toBe('orange')
  })

  test.each([
    ['Cité scolaire, Annecy', 'CITÉ SCOLAIRE'],
    ['Cite des sports', 'CITE DES SPORTS'],
    ['Hall des sports, Rumilly', 'HALL DES SPORTS'],
    ['Cosec, Albertville', 'COSEC'],
    ['Collège Jean Moulin', 'COLLÈGE JEAN MOULIN'],
    ['Lycee du Granier', 'LYCEE DU GRANIER'],
    ['Parc des sports', 'PARC DES SPORTS'],
    ['La Verrerie, Chalon sur Saone', 'SALLE LA VERRERIE'],
    ['Salleneuve', 'SALLE SALLENEUVE'],
    ['Halles Ouest', 'SALLE HALLES OUEST'],
  ])('salle %s → %s', (lieu, salle) => expect(libelleSalle(lieu, false)).toBe(salle))

  test('salle saisie à la place de celle de la FFHB', () => {
    const base = { adversaire: 'ARLESIEN', date: new Date('2026-11-21T18:00:00Z'), lieu: 'Gymnase des Prés Riants', logoAdversaire: null, domicile: true, competition: null }
    expect(composerGameDay(base, { salle: 'Gymnase de Marlioz' }).salle).toBe('GYMNASE DE MARLIOZ')
    expect(composerGameDay(base, { salle: '  ' }).salle).toBe('GYMNASE DES PRÉS RIANTS')
  })

  describe('photo déposée', () => {
    const jeton = 'vercel_blob_rw_AbC123xyz_secret0123456789'
    const hote = 'https://abc123xyz.public.blob.vercel-storage.com'
    test.each([
      [`${hote}/gameday/1764000000-photo.jpg`, true],
      [`${hote}/equipes/photo.jpg`, false],
      [`${hote}/gameday/../equipes/photo.jpg`, false],
      [`${hote}/gameday%2F..%2Fx.jpg`, false],
      ['http://abc123xyz.public.blob.vercel-storage.com/gameday/a.jpg', false],
      ['https://autre.public.blob.vercel-storage.com/gameday/a.jpg', false],
      ['https://abc123xyz.public.blob.vercel-storage.com.exemple.fr/gameday/a.jpg', false],
      ['https://user@abc123xyz.public.blob.vercel-storage.com/gameday/a.jpg', false],
      ['/img/equipes/n2f.jpg', false],
      ['pas une adresse', false],
    ])('%s : %p', (url, attendu) => expect(photoGameDayAutorisee(url, jeton)).toBe(attendu))

    test('sans jeton du magasin, aucune photo déposée', () => {
      expect(photoGameDayAutorisee(`${hote}/gameday/a.jpg`, undefined)).toBe(false)
      expect(photoGameDayAutorisee(`${hote}/gameday/a.jpg`, 'jeton-invalide')).toBe(false)
    })
  })

  test('couleur inconnue : bleu', () => {
    expect(lireCouleur('orange')).toBe('orange')
    expect(lireCouleur('vert')).toBe('bleu')
  })
})
