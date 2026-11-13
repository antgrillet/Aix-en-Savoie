/**
 * Limite de débit en mémoire, par clé (en général une adresse IP).
 *
 * Elle vit dans le processus : sur un hébergement serverless, chaque instance a
 * son propre compteur. C'est un frein contre une boucle naïve, pas une garantie.
 * Les routes qui écrivent en base ajoutent leur propre plafond durable.
 */
const fenetres = new Map<string, number[]>()

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): boolean {
  const now = Date.now()
  const recents = (fenetres.get(key) ?? []).filter((t) => now - t < windowMs)

  if (recents.length >= limit) {
    fenetres.set(key, recents)
    return false
  }

  recents.push(now)
  fenetres.set(key, recents)

  // Éviter que la table grossisse sans fin sous un flot d'adresses différentes.
  if (fenetres.size > 5000) {
    for (const [k, v] of fenetres) {
      if (v.every((t) => now - t >= windowMs)) fenetres.delete(k)
    }
  }

  return true
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'inconnue'
}
