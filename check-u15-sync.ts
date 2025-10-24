import { prisma } from './src/lib/prisma'

async function checkU15Sync() {
  // Trouver l'équipe des moins de 15
  const equipe = await prisma.equipe.findFirst({
    where: {
      OR: [
        { nom: { contains: '15', mode: 'insensitive' } },
        { categorie: { contains: '15', mode: 'insensitive' } },
      ],
    },
    include: {
      matchs: {
        orderBy: {
          date: 'desc',
        },
      },
    },
  })

  if (!equipe) {
    console.log('❌ Aucune équipe trouvée pour les moins de 15')
    return
  }

  console.log(`\n📋 Équipe: ${equipe.nom} (${equipe.categorie})`)
  console.log(`🔗 URL FFHANDBALL: ${equipe.matches || 'NON CONFIGURÉ'}`)
  console.log(`\n📊 Nombre de matchs dans la base: ${equipe.matchs.length}\n`)

  // Récupérer les derniers logs de synchronisation
  const syncLogs = await prisma.syncLog.findMany({
    where: {
      equipeId: equipe.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  console.log('📝 Derniers logs de synchronisation:\n')
  for (const log of syncLogs) {
    console.log(`[${log.createdAt.toLocaleString('fr-FR')}] ${log.status.toUpperCase()}`)
    console.log(`   Message: ${log.message}`)
    console.log(`   Stats: ${log.matchesCreated} créés, ${log.matchesUpdated} mis à jour, ${log.matchesSkipped} ignorés\n`)
  }

  // Afficher quelques matchs récents
  console.log('🏀 Derniers matchs (max 10):\n')
  for (const match of equipe.matchs.slice(0, 10)) {
    const status = match.termine ? `✅ ${match.scoreEquipe}-${match.scoreAdversaire}` : '⏳ À venir'
    const lieu = match.domicile ? '🏠 Domicile' : '✈️  Extérieur'
    console.log(`${match.date.toLocaleDateString('fr-FR')} - ${status} - ${lieu}`)
    console.log(`   vs ${match.adversaire}`)
    console.log(`   Competition: ${match.competition}`)
    console.log('')
  }

  // Analyser les problèmes potentiels
  console.log('\n🔍 ANALYSE:\n')

  // Dupliquer les adversaires
  const adversaires = equipe.matchs.map(m => m.adversaire)
  const duplicates = adversaires.filter((item, index) => adversaires.indexOf(item) !== index)
  if (duplicates.length > 0) {
    console.log(`⚠️  Adversaires dupliqués détectés: ${[...new Set(duplicates)].join(', ')}`)
  }

  // Matchs à la même date
  const dates = equipe.matchs.map(m => m.date.toISOString().split('T')[0])
  const dateDuplicates = dates.filter((item, index) => dates.indexOf(item) !== index)
  if (dateDuplicates.length > 0) {
    console.log(`⚠️  Plusieurs matchs à la même date détectés`)
  }

  // Score suspicieux (trop élevé)
  const highScores = equipe.matchs.filter(m =>
    (m.scoreEquipe && m.scoreEquipe > 50) ||
    (m.scoreAdversaire && m.scoreAdversaire > 50)
  )
  if (highScores.length > 0) {
    console.log(`⚠️  ${highScores.length} matchs avec scores suspicieusement élevés (>50)`)
    for (const m of highScores) {
      console.log(`   - ${m.date.toLocaleDateString()} vs ${m.adversaire}: ${m.scoreEquipe}-${m.scoreAdversaire}`)
    }
  }
}

checkU15Sync()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
