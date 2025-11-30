import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

/**
 * Déclenche le workflow GitHub Actions pour synchroniser les matchs
 * POST /api/sync/matches
 */
export async function POST() {
  try {
    // Vérifier l'authentification admin
    await requireAdmin();

    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO; // format: "owner/repo"

    if (!githubToken || !githubRepo) {
      return NextResponse.json(
        { success: false, error: 'Configuration GitHub manquante (GITHUB_TOKEN, GITHUB_REPO)' },
        { status: 500 }
      );
    }

    console.log('🚀 Déclenchement du workflow GitHub Actions...');

    // Déclencher le workflow via l'API GitHub
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/sync-matches.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
        }),
      }
    );

    if (response.status === 204) {
      console.log('✅ Workflow GitHub Actions déclenché avec succès');
      return NextResponse.json({
        success: true,
        message: 'Synchronisation lancée via GitHub Actions',
      });
    }

    const errorText = await response.text();
    console.error('❌ Erreur GitHub API:', response.status, errorText);

    return NextResponse.json(
      { success: false, error: `Erreur GitHub: ${response.status}` },
      { status: 500 }
    );
  } catch (error) {
    console.error('❌ Erreur lors du déclenchement:', error);

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
 * Récupère le statut du dernier workflow
 * GET /api/sync/matches
 */
export async function GET() {
  try {
    await requireAdmin();

    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;

    if (!githubToken || !githubRepo) {
      return NextResponse.json(
        { success: false, error: 'Configuration GitHub manquante' },
        { status: 500 }
      );
    }

    // Récupérer les dernières exécutions du workflow
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/sync-matches.yml/runs?per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `Bearer ${githubToken}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Impossible de récupérer le statut' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const lastRun = data.workflow_runs?.[0];

    if (!lastRun) {
      return NextResponse.json({
        success: true,
        lastRun: null,
        message: 'Aucune exécution trouvée',
      });
    }

    return NextResponse.json({
      success: true,
      lastRun: {
        status: lastRun.status,
        conclusion: lastRun.conclusion,
        created_at: lastRun.created_at,
        updated_at: lastRun.updated_at,
        html_url: lastRun.html_url,
      },
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
