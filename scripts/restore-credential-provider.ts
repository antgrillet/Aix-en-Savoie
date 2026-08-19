import { prisma } from '../src/lib/prisma'

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
