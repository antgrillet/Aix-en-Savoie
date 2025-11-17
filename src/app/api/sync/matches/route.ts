import { NextResponse } from 'next/server';
import { syncAllMatches } from '@/lib/sync-matches';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

/**
 * Route pour synchroniser les matchs de toutes les équipes
 * GET /api/sync/matches
 */
export async function GET(request: Request) {
  try {
    // Vérifier l'authentification admin
    await requireAdmin();

    console.log('🚀 Démarrage de la synchronisation des matchs...');

    // Lancer la synchronisation
    const results = await syncAllMatches();

    // Calculer les statistiques
    const totalCreated = results.reduce((sum, r) => sum + r.matchesCreated, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.matchesUpdated, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.matchesSkipped, 0);
    const errors = results.filter((r) => r.status === 'error');

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      stats: {
        totalCreated,
        totalUpdated,
        totalSkipped,
        totalErrors: errors.length,
      },
      results,
    });
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * Route pour vérifier le statut de la synchronisation via un cron job
 * Cette route peut être appelée par un service externe (Vercel Cron, etc.)
 * POST /api/sync/matches
 */
export async function POST(request: Request) {
  try {
    // Vérifier l'authentification via un token secret pour les cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('❌ CRON_SECRET non configuré');
      return NextResponse.json(
        { success: false, error: 'Configuration manquante' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Token cron invalide');
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('🚀 Synchronisation automatique démarrée (cron job)...');

    // Lancer la synchronisation
    const results = await syncAllMatches();

    // Calculer les statistiques
    const totalCreated = results.reduce((sum, r) => sum + r.matchesCreated, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.matchesUpdated, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.matchesSkipped, 0);
    const errors = results.filter((r) => r.status === 'error');

    console.log('✅ Synchronisation automatique terminée');

    return NextResponse.json({
      success: true,
      message: 'Synchronisation automatique terminée',
      stats: {
        totalCreated,
        totalUpdated,
        totalSkipped,
        totalErrors: errors.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation automatique:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
