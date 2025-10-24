import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWeekendMatches() {
  console.log('=== VÉRIFICATION DES MATCHS DU WEEK-END ===\n')

  // Calculer le prochain week-end
  const now = new Date()
  const currentDay = now.getDay()
  const daysUntilFriday = currentDay <= 5 ? 5 - currentDay : 7 - currentDay + 5
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysUntilFriday)
  nextFriday.setHours(0, 0, 0, 0)

  const nextSunday = new Date(nextFriday)
  nextSunday.setDate(nextFriday.getDate() + 2)
  nextSunday.setHours(23, 59, 59, 999)

  console.log('📅 Aujourd\'hui:', now.toLocaleString('fr-FR'))
  console.log('🟢 Prochain vendredi:', nextFriday.toLocaleString('fr-FR'))
  console.log('🔴 Prochain dimanche:', nextSunday.toLocaleString('fr-FR'))
  console.log()

  // Récupérer toutes les équipes
  const allEquipes = await prisma.equipe.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      nom: true,
      categorie: true,
      featured: true,
    },
    orderBy: {
      ordre: 'asc',
    },
  })

  console.log(`📊 Total équipes publiées: ${allEquipes.length}`)
  console.log()

  // Récupérer tous les matchs
  const allMatches = await prisma.match.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      adversaire: true,
      date: true,
      equipeId: true,
      termine: true,
      equipe: {
        select: {
          nom: true,
          categorie: true,
          featured: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  console.log(`🏐 Total matchs publiés: ${allMatches.length}`)
  console.log()

  // Matchs du week-end prochain
  const weekendMatches = allMatches.filter(
    (m) => m.date >= nextFriday && m.date <= nextSunday
  )

  console.log(`🎯 Matchs du week-end prochain (${nextFriday.toLocaleDateString('fr-FR')} - ${nextSunday.toLocaleDateString('fr-FR')}): ${weekendMatches.length}`)
  weekendMatches.forEach((match) => {
    console.log(`   - ${match.equipe.nom} vs ${match.adversaire}`)
    console.log(`     Date: ${match.date.toLocaleString('fr-FR')}`)
    console.log(`     Featured: ${match.equipe.featured ? 'OUI' : 'NON'}`)
    console.log()
  })

  // Matchs à venir (tous)
  const upcomingMatches = allMatches.filter((m) => m.date >= now && !m.termine)

  console.log(`📅 Tous les matchs à venir: ${upcomingMatches.length}`)
  upcomingMatches.slice(0, 10).forEach((match) => {
    console.log(`   - ${match.equipe.nom} vs ${match.adversaire}`)
    console.log(`     Date: ${match.date.toLocaleString('fr-FR')}`)
    console.log(`     Featured: ${match.equipe.featured ? 'OUI' : 'NON'}`)
    console.log()
  })

  // Équipes featured
  const featuredEquipes = allEquipes.filter((e) => e.featured)
  console.log(`⭐ Équipes featured: ${featuredEquipes.length}`)
  featuredEquipes.forEach((equipe) => {
    console.log(`   - ${equipe.nom} (${equipe.categorie})`)
  })
  console.log()

  await prisma.$disconnect()
}

checkWeekendMatches().catch(console.error)
