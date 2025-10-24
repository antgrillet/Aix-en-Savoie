import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Suppression des matchs mal parsés de l\'équipe 2...')

  const result = await prisma.match.deleteMany({
    where: {
      equipeId: 2
    }
  })

  console.log(`✅ ${result.count} matchs supprimés`)
  console.log('\n💡 Vous pouvez maintenant relancer la synchronisation dans l\'admin')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
