/**
 * Retrouve les équipes du club engagées sur FFHandball pour une saison, avec le
 * lien à coller dans le champ « Lien championnat » de chaque équipe (admin).
 * À relancer en début de saison et à chaque changement de phase.
 *
 * Usage:
 *   bun run ffhb:equipes                       # saison en cours
 *   bun run ffhb:equipes saison-2027-2028-23   # autre saison
 *
 * Les championnats nationaux ne sont pas parcourus : y copier le lien à la main.
 */

import { listerEngagementsClub } from '../src/lib/ffhandball/client'

const INSTANCES = [
  { type: 'departemental', instance: 'comite-de-savoie-103' },
  { type: 'regional', instance: 'ligue-auvergne-rhone-alpes-4' },
]

/** La saison sportive commence en août ; l'identifiant fédéral vaut l'année de début moins 2004. */
function saisonEnCours(maintenant = new Date()): string {
  const debut = maintenant.getMonth() >= 7 ? maintenant.getFullYear() : maintenant.getFullYear() - 1
  return `saison-${debut}-${debut + 1}-${debut - 2004}`
}

async function main() {
  const saison = process.argv[2] ?? saisonEnCours()
  if (!/^saison-\d{4}-\d{4}-\d+$/.test(saison)) {
    throw new Error(`Saison invalide: ${saison} (attendu: saison-2026-2027-22)`)
  }

  console.log(`🔍 Équipes du club sur FFHandball — ${saison}\n`)
  let total = 0

  for (const { type, instance } of INSTANCES) {
    const engagements = await listerEngagementsClub(saison, type, instance)
    for (const engagement of engagements) {
      total++
      console.log(`${engagement.competition} — ${engagement.poule}`)
      console.log(`  ${engagement.equipe}`)
      console.log(`  ${engagement.url}\n`)
    }
  }

  console.log(`${total} équipe(s) trouvée(s)`)
}

main().catch((error) => {
  console.error('❌', error instanceof Error ? error.message : error)
  process.exit(1)
})
