import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalise le chemin d'une image pour éviter les chemins invalides
 * @param path - Le chemin de l'image (peut commencer par / ou non, ou être une URL absolue)
 * @param defaultPath - Le chemin par défaut si path est vide
 * @returns Un chemin normalisé
 */
export function normalizeImagePath(path: string | null | undefined, defaultPath = '/img/default.jpg'): string {
  if (!path) return defaultPath
  // Si c'est une URL absolue (http:// ou https://), la retourner telle quelle
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // Si le chemin commence déjà par /, le retourner tel quel
  if (path.startsWith('/')) return path
  // Sinon, ajouter / au début
  return `/${path}`
}
