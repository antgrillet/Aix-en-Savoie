/**
 * Largeur d'un texte d'après les chasses de la police TrueType (tables cmap et hmtx),
 * pour réduire un texte variable avant qu'il ne déborde sur le reste du visuel.
 * Pas de crénage : la mesure est légèrement pessimiste, ce qui suffit ici.
 */
export type Mesure = (texte: string) => number

/** Renvoie la largeur d'un texte en em (multiplier par le corps pour avoir des pixels). */
export function creerMesure(octets: ArrayBuffer): Mesure {
  const vue = new DataView(octets)
  const tables: Record<string, number> = {}
  for (let i = 0; i < vue.getUint16(4); i++) {
    const o = 12 + i * 16
    const etiquette = String.fromCharCode(vue.getUint8(o), vue.getUint8(o + 1), vue.getUint8(o + 2), vue.getUint8(o + 3))
    tables[etiquette] = vue.getUint32(o + 8)
  }
  const { head, hhea, hmtx, cmap } = tables
  if (head === undefined || hhea === undefined || hmtx === undefined || cmap === undefined) {
    throw new Error('Police TrueType incomplète')
  }
  const unites = vue.getUint16(head + 18)
  const metriques = vue.getUint16(hhea + 34)
  const chasse = (glyphe: number) => vue.getUint16(hmtx + 4 * Math.min(glyphe, metriques - 1))

  // Sous-table Unicode BMP (plateforme 3, encodage 1), format 4
  let sousTable = -1
  for (let i = 0; i < vue.getUint16(cmap + 2); i++) {
    const base = cmap + 4 + i * 8
    if (vue.getUint16(base) === 3 && vue.getUint16(base + 2) === 1) sousTable = cmap + vue.getUint32(base + 4)
  }
  if (sousTable < 0 || vue.getUint16(sousTable) !== 4) throw new Error('Table cmap non prise en charge')
  const segments = vue.getUint16(sousTable + 6) / 2
  const fins = sousTable + 14
  const debuts = fins + segments * 2 + 2
  const deltas = debuts + segments * 2
  const decalages = deltas + segments * 2

  function glyphe(code: number): number {
    for (let i = 0; i < segments; i++) {
      if (vue.getUint16(fins + i * 2) < code) continue
      const debut = vue.getUint16(debuts + i * 2)
      if (debut > code) return 0
      const delta = vue.getInt16(deltas + i * 2)
      const decalage = vue.getUint16(decalages + i * 2)
      if (decalage === 0) return (code + delta) & 0xffff
      const indice = vue.getUint16(decalages + i * 2 + decalage + (code - debut) * 2)
      return indice === 0 ? 0 : (indice + delta) & 0xffff
    }
    return 0
  }

  const cache = new Map<string, number>()
  return (texte) => {
    let largeur = 0
    for (const caractere of texte) {
      let unite = cache.get(caractere)
      if (unite === undefined) {
        unite = chasse(glyphe(caractere.codePointAt(0) ?? 0))
        cache.set(caractere, unite)
      }
      largeur += unite
    }
    return largeur / unites
  }
}

/** Plus grand corps, au plus `corps`, qui tient dans `largeurMax` pixels (jamais sous `minimum`). */
export function corpsAjuste(largeurEm: number, corps: number, largeurMax: number, minimum: number): number {
  if (largeurEm <= 0) return corps
  return Math.max(minimum, Math.min(corps, Math.floor(largeurMax / largeurEm)))
}
