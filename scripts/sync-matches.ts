/**
 * Synchronise les matchs et classements de toutes les équipes depuis FFHandball.
 *
 * Usage:
 *   bun run sync:matches
 */

import { prisma } from '../src/lib/prisma'
import { syncAllMatches } from '../src/lib/sync-matches'

async function main() {
  console.log('🚀 Démarrage de la synchronisation des matchs...\n')

  const results = await syncAllMatches()

  console.log('\n📋 Résumé par équipe:')
  for (const result of results) {
    if (result.status === 'success') {
      console.log(`\n✅ ${result.equipeNom}`)
      console.log(`   ${result.message}`)
      if (result.orphelins.length > 0) {
        console.log(`   À vérifier (absents de FFHandball): ${result.orphelins.join(' ; ')}`)
      }
    } else if (result.status === 'warning') {
      console.log(`\n⚠️  ${result.equipeNom}`)
      console.log(`   Avertissement: ${result.message}`)
      if (result.orphelins.length > 0) {
        console.log(`   À vérifier (absents de FFHandball): ${result.orphelins.join(' ; ')}`)
      }
    } else {
      console.log(`\n❌ ${result.equipeNom}`)
      console.log(`   Erreur: ${result.message}`)
    }
  }

  const erreurs = results.filter((result) => result.status === 'error').length
  const avertissements = results.filter((result) => result.status === 'warning').length
  await prisma.$disconnect()

  // Une équipe en erreur ou en avertissement ne doit pas passer inaperçue dans GitHub Actions
  if (results.length > 0 && erreurs === results.length) {
    console.error('\n❌ Toutes les équipes ont échoué')
    process.exit(1)
  }
  if (erreurs + avertissements > 0) {
    console.error(
      `\n⚠️  Sur ${results.length} équipe(s) : ${erreurs} en erreur, ${avertissements} en avertissement`
    )
    process.exit(2)
  }
  console.log('\n✅ Synchronisation terminée')
}

main().catch(async (error) => {
  console.error('\n❌ Erreur fatale:', error)
  await prisma.$disconnect().catch(() => {})
  process.exit(1)
})
