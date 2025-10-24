import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const matches = await prisma.match.findMany({
    where: {
      equipeId: 2
    },
    orderBy: {
      date: 'desc'
    },
    take: 20,
    include: {
      equipe: {
        select: {
          nom: true
        }
      }
    }
  })

  console.log('\n📊 Matchs trouvés:', matches.length)
  console.log('---')

  matches.forEach((match, i) => {
    const dateStr = match.date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const score = match.termine
      ? `${match.scoreEquipe} - ${match.scoreAdversaire}`
      : 'À venir'

    const lieu = match.domicile ? '🏠' : '🚌'

    console.log(`${i + 1}. ${lieu} ${match.equipe.nom} vs ${match.adversaire}`)
    console.log(`   📅 ${dateStr} | ${score} | ${match.competition}`)
    console.log(`   ✅ Publié: ${match.published} | Terminé: ${match.termine}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
