import { prisma } from './prisma';
import { scrapeFFHandballMatches } from './scraping/ffhandball';

interface SyncResult {
  equipeId: number;
  equipeNom: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  matchesCreated: number;
  matchesUpdated: number;
  matchesSkipped: number;
}

/**
 * Synchronise les matchs d'une équipe
 */
export async function syncTeamMatches(
  equipeId: number,
  equipeNom: string,
  calendrierUrl: string
): Promise<SyncResult> {
  let matchesCreated = 0;
  let matchesUpdated = 0;
  let matchesSkipped = 0;

  try {
    console.log(`🔄 Synchronisation de ${equipeNom}...`);

    // Scraper les matchs depuis FFHB
    const scrapedMatches = await scrapeFFHandballMatches(calendrierUrl, equipeNom);

    console.log(`  ℹ️  ${scrapedMatches.length} matchs trouvés`);

    // Synchroniser chaque match (passés et futurs)
    for (const matchData of scrapedMatches) {
      // Vérifier si le match existe déjà (même date et adversaire)
      const existingMatch = await prisma.match.findFirst({
        where: {
          equipeId,
          adversaire: matchData.adversaire,
          date: matchData.date,
        },
      });

      if (existingMatch) {
        // Mettre à jour si le score a changé ou si le match est marqué comme terminé
        const needsUpdate =
          matchData.termine &&
          (existingMatch.scoreEquipe !== matchData.scoreEquipe ||
            existingMatch.scoreAdversaire !== matchData.scoreAdversaire ||
            existingMatch.termine !== matchData.termine);

        if (needsUpdate) {
          await prisma.match.update({
            where: { id: existingMatch.id },
            data: {
              scoreEquipe: matchData.scoreEquipe,
              scoreAdversaire: matchData.scoreAdversaire,
              termine: matchData.termine,
              logoAdversaire: matchData.logoAdversaire,
              lieu: matchData.lieu,
            },
          });
          matchesUpdated++;
          console.log(`  ✅ Match mis à jour: ${matchData.adversaire}`);
        } else {
          matchesSkipped++;
        }
      } else {
        // Créer le nouveau match
        await prisma.match.create({
          data: {
            equipeId,
            adversaire: matchData.adversaire,
            date: matchData.date,
            lieu: matchData.lieu,
            domicile: matchData.domicile,
            competition: matchData.competition,
            scoreEquipe: matchData.scoreEquipe,
            scoreAdversaire: matchData.scoreAdversaire,
            logoAdversaire: matchData.logoAdversaire,
            termine: matchData.termine,
            published: true,
          },
        });
        matchesCreated++;
        console.log(`  ➕ Match créé: ${matchData.adversaire}`);
      }
    }

    // Logger la synchronisation
    await prisma.syncLog.create({
      data: {
        equipeId,
        type: 'matches',
        status: 'success',
        message: `Synchronisation réussie: ${matchesCreated} créés, ${matchesUpdated} mis à jour, ${matchesSkipped} ignorés`,
        matchesCreated,
        matchesUpdated,
        matchesSkipped,
      },
    });

    return {
      equipeId,
      equipeNom,
      status: 'success',
      message: `✅ ${matchesCreated} créés, ${matchesUpdated} mis à jour`,
      matchesCreated,
      matchesUpdated,
      matchesSkipped,
    };
  } catch (error) {
    console.error(`  ❌ Erreur pour ${equipeNom}:`, error);

    // Logger l'erreur
    await prisma.syncLog.create({
      data: {
        equipeId,
        type: 'matches',
        status: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        matchesCreated: 0,
        matchesUpdated: 0,
        matchesSkipped: 0,
      },
    });

    return {
      equipeId,
      equipeNom,
      status: 'error',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      matchesCreated: 0,
      matchesUpdated: 0,
      matchesSkipped: 0,
    };
  }
}

/**
 * Synchronise les matchs de toutes les équipes
 */
export async function syncAllMatches(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  // Récupérer toutes les équipes publiées avec leur lien calendrier
  const equipes = await prisma.equipe.findMany({
    where: {
      published: true,
      matches: { not: null },
    },
    select: {
      id: true,
      nom: true,
      matches: true,
    },
  });

  console.log(`📅 Synchronisation de ${equipes.length} équipes`);

  for (const equipe of equipes) {
    if (!equipe.matches) continue;

    const result = await syncTeamMatches(equipe.id, equipe.nom, equipe.matches);
    results.push(result);

    // Attendre un peu entre chaque équipe pour ne pas surcharger le serveur
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Afficher le résumé
  console.log('\n📊 Résultats de la synchronisation:');
  console.log('=====================================');

  const totalCreated = results.reduce((sum, r) => sum + r.matchesCreated, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.matchesUpdated, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.matchesSkipped, 0);
  const errors = results.filter((r) => r.status === 'error');

  console.log(`✅ Matchs créés: ${totalCreated}`);
  console.log(`🔄 Matchs mis à jour: ${totalUpdated}`);
  console.log(`⏭️  Matchs ignorés: ${totalSkipped}`);
  console.log(`❌ Erreurs: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nDétail des erreurs:');
    errors.forEach((error) => {
      console.log(`  - ${error.equipeNom}: ${error.message}`);
    });
  }

  return results;
}
