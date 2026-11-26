/**
 * Retrouve l'équipe dont parle un article.
 *
 * L'article n'a pas de lien direct vers une équipe : on la déduit du titre et des
 * tags (« Seniors Masculins 3 » dans le titre, « SM3 » ou la catégorie en tag).
 * En cas d'égalité entre deux équipes, on n'affiche rien plutôt qu'une mauvaise équipe.
 */

export interface EquipeCandidate {
  id: number
  nom: string
  categorie: string
}

const normaliser = (texte: string) =>
  texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const compact = (texte: string) => normaliser(texte).replace(/ /g, '')

/** « Seniors masculins 3 » → « sm3 » ; null si le nom ne se prête pas à un sigle. */
function sigle(nom: string): string | null {
  const mots = normaliser(nom).split(' ').filter(Boolean)
  const lettres = mots.filter((m) => /^[a-z]/.test(m))
  if (lettres.length < 2) return null
  return mots.map((m) => (/^\d+$/.test(m) ? m : m[0])).join('')
}

const contientExpression = (texte: string, expression: string) =>
  expression.length > 0 && ` ${texte} `.includes(` ${expression} `)

export function trouverEquipeLiee<T extends EquipeCandidate>(
  article: { titre: string; tags: string[] },
  equipes: T[]
): T | null {
  const titre = normaliser(article.titre)
  const tags = article.tags.map(normaliser).filter(Boolean)
  const tagsCompacts = tags.map((t) => t.replace(/ /g, ''))

  const scores = equipes.map((equipe) => {
    const nom = normaliser(equipe.nom)
    const sigleEquipe = sigle(equipe.nom)
    const categorie = compact(equipe.categorie)
    let score = 0
    if (contientExpression(titre, nom)) score += 3
    if (tags.some((t) => contientExpression(t, nom))) score += 3
    if (sigleEquipe && tagsCompacts.includes(sigleEquipe)) score += 2
    if (categorie.length >= 2 && tagsCompacts.includes(categorie)) score += 1
    return { equipe, score }
  })

  const meilleur = Math.max(0, ...scores.map((s) => s.score))
  if (meilleur === 0) return null
  const gagnants = scores.filter((s) => s.score === meilleur)
  return gagnants.length === 1 ? gagnants[0].equipe : null
}
