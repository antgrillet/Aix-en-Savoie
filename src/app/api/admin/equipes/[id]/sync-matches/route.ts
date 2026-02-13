import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scrapeFFHandballMatches, scrapeFFHandballClassement } from '@/lib/scraping/ffhandball'
import { requireAdmin } from '@/lib/auth-utils'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier que l'utilisateur est admin
    await requireAdmin()

    const { id } = await params
    const equipeId = parseInt(id)

    // Récupérer l'équipe
    const equipe = await prisma.equipe.findUnique({
      where: { id: equipeId },
      select: {
        id: true,
        nom: true,
        matches: true,
      },
    })

    if (!equipe) {
      return NextResponse.json(
        { error: 'Équipe non trouvée' },
        { status: 404 }
      )
    }

    if (!equipe.matches) {
      return NextResponse.json(
        { error: 'Aucun lien de championnat configuré pour cette équipe' },
        { status: 400 }
      )
    }

    console.log(`🔄 Synchronisation des matchs pour ${equipe.nom}...`)

    // Scraper les matchs depuis FFHANDBALL
    const scrapedMatches = await scrapeFFHandballMatches(equipe.matches, equipe.nom)

    console.log(`📦 ${scrapedMatches.length} matchs récupérés depuis FFHANDBALL`)

    // Créer ou mettre à jour les matchs dans la base de données
    let created = 0
    let updated = 0
    let skipped = 0

    for (const match of scrapedMatches) {
      // Vérifier si le match existe déjà (même adversaire et date proche)
      const existingMatch = await prisma.match.findFirst({
        where: {
          equipeId: equipe.id,
          adversaire: match.adversaire,
          date: {
            gte: new Date(match.date.getTime() - 24 * 60 * 60 * 1000), // -1 jour
            lte: new Date(match.date.getTime() + 24 * 60 * 60 * 1000), // +1 jour
          },
        },
      })

      if (existingMatch) {
        const dateChanged = existingMatch.date.getTime() !== match.date.getTime()
        const domicileChanged = existingMatch.domicile !== match.domicile
        const logoChanged = match.logoAdversaire !== existingMatch.logoAdversaire
        const scoreChanged =
          match.scoreEquipe !== existingMatch.scoreEquipe ||
          match.scoreAdversaire !== existingMatch.scoreAdversaire ||
          match.termine !== existingMatch.termine
        const lieuChanged = existingMatch.lieu !== match.lieu && match.lieu !== 'À déterminer'
        const competitionChanged = existingMatch.competition !== match.competition && match.competition

        const updateData: Parameters<typeof prisma.match.update>[0]['data'] = {}
        if (dateChanged) updateData.date = match.date
        if (domicileChanged) updateData.domicile = match.domicile
        if (scoreChanged) {
          updateData.scoreEquipe = match.scoreEquipe
          updateData.scoreAdversaire = match.scoreAdversaire
          updateData.termine = match.termine
        }
        if (logoChanged) updateData.logoAdversaire = match.logoAdversaire
        if (lieuChanged) updateData.lieu = match.lieu
        if (competitionChanged) updateData.competition = match.competition

        if (Object.keys(updateData).length > 0) {
          await prisma.match.update({
            where: { id: existingMatch.id },
            data: {
              ...updateData,
            },
          })
          updated++
          console.log(`✏️  Match mis à jour: ${equipe.nom} vs ${match.adversaire}`)
        } else {
          skipped++
        }
      } else {
        // Créer un nouveau match
        await prisma.match.create({
          data: {
            equipeId: equipe.id,
            adversaire: match.adversaire,
            date: match.date,
            lieu: match.lieu,
            domicile: match.domicile,
            competition: match.competition,
            scoreEquipe: match.scoreEquipe,
            scoreAdversaire: match.scoreAdversaire,
            termine: match.termine,
            logoAdversaire: match.logoAdversaire,
            published: true,
          },
        })
        created++
        console.log(`✅ Match créé: ${equipe.nom} vs ${match.adversaire}`)
      }
    }

    // Scraper le classement depuis FFHANDBALL
    console.log(`🏆 Synchronisation du classement pour ${equipe.nom}...`)
    let classementUpdated = 0

    try {
      const scrapedClassement = await scrapeFFHandballClassement(equipe.matches)
      console.log(`📊 ${scrapedClassement.length} équipes récupérées dans le classement`)

      // Supprimer l'ancien classement de cette équipe
      await prisma.classement.deleteMany({
        where: { equipeId: equipe.id },
      })

      // Créer les nouvelles entrées de classement
      for (const team of scrapedClassement) {
        await prisma.classement.create({
          data: {
            equipeId: equipe.id,
            position: team.position,
            club: team.club,
            points: team.points,
          },
        })
      }

      classementUpdated = scrapedClassement.length
      console.log(`✅ Classement mis à jour: ${classementUpdated} équipes`)
    } catch (classementError) {
      console.error('⚠️  Erreur lors de la synchronisation du classement:', classementError)
      // Continue même si le classement échoue
    }

    // Créer un log de synchronisation
    await prisma.syncLog.create({
      data: {
        equipeId: equipe.id,
        type: 'matches',
        status: 'success',
        message: `${created} créés, ${updated} mis à jour, ${skipped} ignorés. Classement: ${classementUpdated} équipes`,
        matchesCreated: created,
        matchesUpdated: updated,
        matchesSkipped: skipped,
      },
    })

    return NextResponse.json({
      success: true,
      summary: {
        total: scrapedMatches.length,
        created,
        updated,
        skipped,
        classementUpdated,
      },
      message: `Synchronisation terminée: ${created} matchs créés, ${updated} mis à jour, ${skipped} ignorés. Classement: ${classementUpdated} équipes`,
    })
  } catch (error: any) {
    console.error('❌ Erreur lors de la synchronisation:', error)

    // Logger l'erreur
    try {
      const { id } = await params
      await prisma.syncLog.create({
        data: {
          equipeId: parseInt(id),
          type: 'matches',
          status: 'error',
          message: error.message || 'Erreur inconnue',
          matchesCreated: 0,
          matchesUpdated: 0,
          matchesSkipped: 0,
        },
      })
    } catch (logError) {
      console.error('Erreur lors du logging:', logError)
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la synchronisation',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
