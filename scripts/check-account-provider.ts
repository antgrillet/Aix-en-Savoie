import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking account provider ID...\n')

  const account = await prisma.account.findFirst({
    where: {
      accountId: 'admin@hbc-aix.fr',
    },
  })

  if (!account) {
    console.error('❌ Account not found')
    return
  }

  console.log('📋 Account details:')
  console.log('   - accountId:', account.accountId)
  console.log('   - providerId:', account.providerId)
  console.log('   - userId:', account.userId)
  console.log('   - has password:', !!account.password)
  console.log()

  console.log('⚠️  Expected providerId for Better Auth email/password: "credential"')
  console.log('   Current providerId:', account.providerId)

  if (account.providerId !== 'credential') {
    console.log('\n❌ Provider ID mismatch!')
    console.log('   Run: npx prisma studio')
    console.log('   And update the providerId to "credential"')
  } else {
    console.log('\n✅ Provider ID is correct')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
