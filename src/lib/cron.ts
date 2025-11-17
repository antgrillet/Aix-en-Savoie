import cron from 'node-cron';
import { syncAllMatches } from './sync-matches';

/**
 * Configuration et démarrage des tâches cron
 *
 * Calendrier des synchronisations:
 * - Tous les jours à 7h00: Synchronisation complète
 * - Tous les vendredis à 18h00: Synchronisation avant le weekend
 * - Tous les dimanches à 20h00: Synchronisation après le weekend
 */
export function startCronJobs() {
  // Vérifier que les cron jobs ne sont pas déjà démarrés
  if (typeof global.cronJobsStarted !== 'undefined') {
    console.log('⏰ Cron jobs déjà démarrés');
    return;
  }

  console.log('⏰ Démarrage des tâches cron...');

  // Synchronisation quotidienne à 7h00
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ [CRON] Synchronisation quotidienne des matchs (7h00)');
    try {
      await syncAllMatches();
      console.log('✅ [CRON] Synchronisation quotidienne terminée');
    } catch (error) {
      console.error('❌ [CRON] Erreur lors de la synchronisation quotidienne:', error);
    }
  });

  // Synchronisation du vendredi à 18h00 (avant le weekend)
  cron.schedule('0 18 * * 5', async () => {
    console.log('⏰ [CRON] Synchronisation du vendredi soir (18h00)');
    try {
      await syncAllMatches();
      console.log('✅ [CRON] Synchronisation du vendredi terminée');
    } catch (error) {
      console.error('❌ [CRON] Erreur lors de la synchronisation du vendredi:', error);
    }
  });

  // Synchronisation du dimanche à 20h00 (après le weekend)
  cron.schedule('0 20 * * 0', async () => {
    console.log('⏰ [CRON] Synchronisation du dimanche soir (20h00)');
    try {
      await syncAllMatches();
      console.log('✅ [CRON] Synchronisation du dimanche terminée');
    } catch (error) {
      console.error('❌ [CRON] Erreur lors de la synchronisation du dimanche:', error);
    }
  });

  // Marquer les cron jobs comme démarrés
  global.cronJobsStarted = true;

  console.log('✅ Tâches cron configurées:');
  console.log('   - Quotidienne: 7h00');
  console.log('   - Vendredi: 18h00');
  console.log('   - Dimanche: 20h00');
}

/**
 * Fonction pour tester immédiatement la synchronisation
 */
export async function testSync() {
  console.log('🧪 Test de synchronisation manuel...');
  try {
    const results = await syncAllMatches();
    console.log('✅ Test de synchronisation terminé avec succès');
    return results;
  } catch (error) {
    console.error('❌ Erreur lors du test de synchronisation:', error);
    throw error;
  }
}

// Type augmentation pour global
declare global {
  var cronJobsStarted: boolean | undefined;
}
