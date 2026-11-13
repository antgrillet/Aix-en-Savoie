const PAGE_MAX = 10_000

// Numéro de page lu dans l'URL : toute valeur absente, non numérique, nulle,
// négative ou non entière ramène à la première page, et un numéro démesuré est
// plafonné pour garder un `skip` raisonnable.
export function lireNumeroPage(valeur: string | undefined): number {
  if (!valeur || !/^\d+$/.test(valeur)) return 1
  const page = Number(valeur)
  if (page < 1) return 1
  return Math.min(page, PAGE_MAX)
}
