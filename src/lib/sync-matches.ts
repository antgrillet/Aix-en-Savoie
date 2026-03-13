import { prisma } from './prisma';
import { scrapeFFHandballMatches, scrapeFFHandballPlateauMatches, scrapeFFHandballClassement, isPlateauCategory } from './scraping/ffhandball';

interface SyncResult {
  equipeId: number;
  equipeNom: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  matchesCreated: number;
  matchesUpdated: number;
  matchesSkipped: number;
  classementUpdated: number;
}

/**
 * Synchronise les matchs d'une équipe
 */
export async function syncTeamMatches(
  equipeId: number,
  equipeNom: string,
  calendrierUrl: string,
  categorie?: string
): Promise<SyncResult> {
  let matchesCreated = 0;
  let matchesUpdated = 0;
  let matchesSkipped = 0;

  try {
    console.log(`🔄 Synchronisation de ${equipeNom}...`);

    // Utiliser le scraper plateau pour les catégories -11 et -9
    const isPlateau = categorie ? isPlateauCategory(categorie) : false
    const scrapedMatches = isPlateau
      ? await scrapeFFHandballPlateauMatches(calendrierUrl, equipeNom)
      : await scrapeFFHandballMatches(calendrierUrl, equipeNom);

    console.log(`  ℹ️  ${scrapedMatches.length} matchs trouvés`);

    // Synchroniser chaque match (passés et futurs)
    for (const matchData of scrapedMatches) {
      // Vérifier si le match existe déjà (même adversaire et date proche)
      const existingMatch = await prisma.match.findFirst({
        where: {
          equipeId,
          adversaire: matchData.adversaire,
          date: {
            gte: new Date(matchData.date.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(matchData.date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existingMatch) {
        const dateChanged = existingMatch.date.getTime() !== matchData.date.getTime();
        const domicileChanged = existingMatch.domicile !== matchData.domicile;
        const logoChanged = matchData.logoAdversaire !== existingMatch.logoAdversaire;
        const scoreChanged =
          existingMatch.scoreEquipe !== matchData.scoreEquipe ||
          existingMatch.scoreAdversaire !== matchData.scoreAdversaire ||
          existingMatch.termine !== matchData.termine;
        const lieuChanged = existingMatch.lieu !== matchData.lieu && matchData.lieu !== 'À déterminer';
        const competitionChanged = existingMatch.competition !== matchData.competition && matchData.competition;

        const updateData: Parameters<typeof prisma.match.update>[0]['data'] = {};
        if (dateChanged) updateData.date = matchData.date;
        if (domicileChanged) updateData.domicile = matchData.domicile;
        if (scoreChanged) {
          updateData.scoreEquipe = matchData.scoreEquipe;
          updateData.scoreAdversaire = matchData.scoreAdversaire;
          updateData.termine = matchData.termine;
        }
        if (logoChanged) updateData.logoAdversaire = matchData.logoAdversaire;
        if (lieuChanged) updateData.lieu = matchData.lieu;
        if (competitionChanged) updateData.competition = matchData.competition;

        if (Object.keys(updateData).length > 0) {
          await prisma.match.update({
            where: { id: existingMatch.id },
            data: {
              ...updateData,
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

    // Synchroniser le classement
    let classementUpdated = 0;
    try {
      console.log(`🏆 Synchronisation du classement pour ${equipeNom}...`);
      const scrapedClassement = await scrapeFFHandballClassement(calendrierUrl);
      console.log(`📊 ${scrapedClassement.length} équipes récupérées dans le classement`);

      await prisma.classement.deleteMany({ where: { equipeId } });
      for (const team of scrapedClassement) {
        await prisma.classement.create({
          data: {
            equipeId,
            position: team.position,
            club: team.club,
            points: team.points,
          },
        });
      }
      classementUpdated = scrapedClassement.length;
      console.log(`✅ Classement mis à jour: ${classementUpdated} équipes`);
    } catch (classementError) {
      console.error(`⚠️  Erreur classement pour ${equipeNom}:`, classementError);
    }

    // Logger la synchronisation
    await prisma.syncLog.create({
      data: {
        equipeId,
        type: 'matches',
        status: 'success',
        message: `Synchronisation réussie: ${matchesCreated} créés, ${matchesUpdated} mis à jour, ${matchesSkipped} ignorés. Classement: ${classementUpdated} équipes`,
        matchesCreated,
        matchesUpdated,
        matchesSkipped,
      },
    });

    return {
      equipeId,
      equipeNom,
      status: 'success',
      message: `✅ ${matchesCreated} créés, ${matchesUpdated} mis à jour. Classement: ${classementUpdated}`,
      matchesCreated,
      matchesUpdated,
      matchesSkipped,
      classementUpdated,
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
      classementUpdated: 0,
    };
  }
}

/**
 * Synchronise les matchs et classements de toutes les équipes
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
      categorie: true,
      matches: true,
    },
  });

  console.log(`📅 Synchronisation de ${equipes.length} équipes`);

  for (const equipe of equipes) {
    if (!equipe.matches) continue;

    const result = await syncTeamMatches(equipe.id, equipe.nom, equipe.matches, equipe.categorie);
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
