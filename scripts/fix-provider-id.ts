import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('🔧 Checking and fixing provider ID...\n')

  // Find admin account
  const account = await prisma.account.findFirst({
    where: {
      accountId: 'admin@hbc-aix.fr',
    },
  })

  if (!account) {
    console.error('❌ Account not found')
    return
  }

  console.log('Current provider ID:', account.providerId)

  if (account.providerId === 'credential') {
    console.log('\n🔄 Updating provider ID from "credential" to "email"...')

    await prisma.account.update({
      where: { id: account.id },
      data: { providerId: 'email' },
    })

    console.log('✅ Provider ID updated successfully!')
    console.log('   Old value: credential')
    console.log('   New value: email')
    console.log('\n🔐 Try logging in now with:')
    console.log('   Email: admin@hbc-aix.fr')
    console.log('   Password: admin123')
  } else {
    console.log('✅ Provider ID is already:', account.providerId)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
