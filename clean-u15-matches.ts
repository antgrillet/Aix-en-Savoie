import { prisma } from './src/lib/prisma'

async function cleanU15Matches() {
  // Trouver l'équipe des moins de 15
  const equipe = await prisma.equipe.findFirst({
    where: {
      OR: [
        { nom: { contains: '15', mode: 'insensitive' } },
        { categorie: { contains: '15', mode: 'insensitive' } },
      ],
    },
  })

  if (!equipe) {
    console.log('❌ Aucune équipe trouvée pour les moins de 15')
    return
  }

  console.log(`\n📋 Équipe: ${equipe.nom} (${equipe.categorie})\n`)

  // 1. Supprimer les matchs avec des scores suspects (> 50)
  const highScoreMatches = await prisma.match.deleteMany({
    where: {
      equipeId: equipe.id,
      OR: [
        { scoreEquipe: { gt: 50 } },
        { scoreAdversaire: { gt: 50 } },
      ],
    },
  })

  console.log(`✅ ${highScoreMatches.count} matchs avec scores suspects (>50) supprimés`)

  // 2. Supprimer les matchs dont l'adversaire commence par un chiffre (mauvais parsing)
  const allMatches = await prisma.match.findMany({
    where: { equipeId: equipe.id },
  })

  let badParsingCount = 0
  for (const match of allMatches) {
    if (/^\d/.test(match.adversaire)) {
      await prisma.match.delete({
        where: { id: match.id },
      })
      console.log(`  Supprimé: ${match.adversaire} (${match.date.toLocaleDateString()})`)
      badParsingCount++
    }
  }

  console.log(`✅ ${badParsingCount} matchs avec parsing incorrect supprimés`)

  // 3. Supprimer les doublons (même adversaire et date proche)
  const remainingMatches = await prisma.match.findMany({
    where: { equipeId: equipe.id },
    orderBy: { date: 'asc' },
  })

  let duplicateCount = 0
  const seen = new Set<string>()

  for (const match of remainingMatches) {
    // Créer une clé unique basée sur l'adversaire et la date (jour)
    const dateKey = match.date.toISOString().split('T')[0]
    const key = `${match.adversaire.toLowerCase()}-${dateKey}`

    if (seen.has(key)) {
      await prisma.match.delete({
        where: { id: match.id },
      })
      console.log(`  Doublon supprimé: ${match.adversaire} (${match.date.toLocaleDateString()})`)
      duplicateCount++
    } else {
      seen.add(key)
    }
  }

  console.log(`✅ ${duplicateCount} doublons supprimés`)

  // Afficher le résultat final
  const finalCount = await prisma.match.count({
    where: { equipeId: equipe.id },
  })

  console.log(`\n📊 Résultat: ${finalCount} matchs restants dans la base`)

  // Afficher quelques matchs pour vérifier
  const sampleMatches = await prisma.match.findMany({
    where: { equipeId: equipe.id },
    orderBy: { date: 'desc' },
    take: 5,
  })

  console.log('\n🏀 Exemples de matchs restants:')
  for (const match of sampleMatches) {
    const status = match.termine ? `✅ ${match.scoreEquipe}-${match.scoreAdversaire}` : '⏳ À venir'
    const lieu = match.domicile ? '🏠' : '✈️ '
    console.log(`  ${lieu} ${match.date.toLocaleDateString('fr-FR')} - ${status} vs ${match.adversaire}`)
  }
}

cleanU15Matches()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
