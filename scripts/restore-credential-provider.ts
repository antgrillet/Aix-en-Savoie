import { prisma } from '../src/lib/prisma'

async function main() {
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@hbc-aix.fr' },
    select: { id: true },
  })
  await prisma.account.updateMany({
    where: {
      userId: admin.id,
      OR: [{ providerId: 'credential' }, { accountId: 'admin@hbc-aix.fr' }],
    },
    data: { providerId: 'credential', accountId: admin.id },
  })

  console.log('✅ Provider ID restored to "credential"')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
