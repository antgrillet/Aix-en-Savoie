import { Anton, Great_Vibes } from 'next/font/google'

/**
 * Polices des affiches du club (Game Day, planning, résultats), chargées
 * seulement sur la page d'accueil : Anton pour les capitales, une écriture
 * manuscrite pour le mot orange qui chevauche.
 */
export const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
})

export const scriptAffiche = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
})
