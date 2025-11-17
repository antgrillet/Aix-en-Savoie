import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.account.updateMany({
    where: { accountId: 'admin@hbc-aix.fr' },
    data: { providerId: 'credential' },
  })

  console.log('✅ Provider ID restored to "credential"')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
