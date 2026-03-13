/**
 * Script pour tester la synchronisation des matchs manuellement
 *
 * Usage:
 *   pnpm tsx scripts/sync-matches.ts
 */

import { syncAllMatches } from '../src/lib/sync-matches';

async function main() {
  console.log('🚀 Démarrage de la synchronisation manuelle des matchs...\n');

  try {
    const results = await syncAllMatches();

    console.log('\n' + '='.repeat(50));
    console.log('✅ Synchronisation terminée avec succès !');
    console.log('='.repeat(50));

    // Afficher un résumé détaillé
    console.log('\n📋 Résumé par équipe:');
    results.forEach((result) => {
      const icon = result.status === 'success' ? '✅' : '❌';
      console.log(`\n${icon} ${result.equipeNom}`);
      if (result.status === 'success') {
        console.log(`   Créés: ${result.matchesCreated}`);
        console.log(`   Mis à jour: ${result.matchesUpdated}`);
        console.log(`   Ignorés: ${result.matchesSkipped}`);
        console.log(`   Classement: ${result.classementUpdated} équipes`);
      } else {
        console.log(`   Erreur: ${result.message}`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
