/**
 * Fichier d'instrumentation Next.js
 * Ce fichier est exécuté au démarrage de l'application
 */

export async function register() {
  // Vérifier qu'on est sur le serveur (pas dans le build)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Importer dynamiquement pour éviter les problèmes de build
    const { startCronJobs } = await import('./lib/cron');

    // Démarrer les cron jobs uniquement en production ou si explicitement demandé
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
      startCronJobs();
      console.log('✅ Cron jobs activés');
    } else {
      console.log('⏸️  Cron jobs désactivés (dev mode)');
      console.log('   Pour les activer, définir ENABLE_CRON=true dans .env');
    }
  }
}
